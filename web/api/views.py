from __future__ import unicode_literals
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from rest_framework import generics
from django.db.models import Q
import subprocess
from django.conf import settings
from frontend.models import Video, Shot, Annotation
from rest_framework import viewsets
from .serializers import VideosSerializer, AnnotationSerializer, ShotSerializer
from rest_framework.response import Response
from django.http import Http404
import os
import glob
import zipfile
from io import BytesIO
from django.conf import settings
import csv
import json
import operator
import functools
from django.core import serializers
from itertools import chain

def upload(request):
    if request.method == 'POST':
        handle_uploaded_file(request.FILES['audio'], request.POST['id'])
    return HttpResponse("")

def get_keywords(request):
    queryset = Shot.objects.exclude(keywords__isnull=True);

    json_data = queryset.values_list('keywords')
    json_data_list = list(queryset.values_list('keywords'))

    # result = ''

    resultList = []

    for element in json_data_list:
        str = ''.join(element)
        my_list = [x.strip() for x in str.split(',')]
        resultList = list(set(resultList) | set(my_list))

    print(resultList)

    # print(json.dumps(json_data_list))

    # json_data = serializers.serialize('json', list(queryset), fields=('keywords'))

    return HttpResponse(json.dumps(resultList), content_type="application/json")

#added now
def handle_uploaded_file(f, id):
    with open('..'+settings.MEDIA_ROOT + id + '_audio.wav', 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)

def process_edited_videos(request):
    debug = open('.'+settings.MEDIA_URL2+'debug.txt', 'w+')

    videos = request.GET.get('videos', None)
    effects = request.GET.get('effects', None)
    texts = request.GET.get('texts', None)
    audios = request.GET.get('audios', None)
    subtitles = request.GET.get('subtitles', None)

    if videos is not None:
        f = open('./frontend/'+settings.MEDIA_URL2+'file.txt', 'w+')

        effects = effects.split(",")
        videos = videos.split(",")
        texts = texts.split(",")
        audios = audios.split(",")

        print ("audio")
        print (audios)
        print (videos)
        subtitles = subtitles.split("||,")

        for index, i in enumerate(videos):

            video_subtitles = subtitles[index].split("||")
            ass = open('./frontend/'+settings.MEDIA_URL2 + i + '.ass', 'w+')
            ass.write(
                "[Script Info]\r\n; This is an Advanced Sub Station Alpha v4+ script.\r\nTitle: phpiI4Eu4\r\nScriptType: v4.00+\r\nCollisions: Normal\r\nPlayDepth: 0\r\n\r\n")
            ass.write(
                "[V4+ Styles]\r\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\r\n")
            ass.write(
                "Style: Default,Arial,20,&H00FFFFFF,&H0300FFFF,&H00000000,&H02000000,0,0,0,0,100,100,0,0,1,1,1,2,10,10,10,1\r\n\r\n")
            ass.write(
                "[Events]\r\nFormat: Layer, Start, End, Style, Actor, MarginL, MarginR, MarginV, Effect, Text\r\n")
            for num, s in enumerate(video_subtitles):
                if (s != ""):
                    subtitle = s.split("|")
                    start = subtitle[0]
                    end = subtitle[1]
                    sub = subtitle[2]
                    ass.write("Dialogue: 0,0:" + start + "0,0:" + end + "0,Default,,0,0,0,," + sub + "\r\n")
            ass.close()

            duration = '2'
            fade_in = ''
            fade_out = ''
            if index == 0:
                if effects[index] == '1':
                    fade_out = ',reverse,fade=d=' + duration + ',reverse'
            else:
                if effects[index - 1] == '1':
                    fade_in = ',fade=d=' + duration
                if index < len(videos) and effects[index] == '1':
                    fade_out = ',reverse,fade=d=' + duration + ',reverse'

            filename = i + ".mp4"
            scale_cmd = 'ffmpeg -y -i ' + filename + ' -filter_complex [0:v]scale="480:270",setdar=dar=16/9' + fade_in + fade_out + '[Scaled] -map [Scaled] -map 0:a -r 24 -acodec aac -ab 256k -ar 48000 -ac 2 ' + filename.replace(
                ".mp4", "_scaled.mp4")
            subprocess.call("(cd .."+settings.MEDIA_ROOT+" && " + scale_cmd + ")", shell=True)

            if (audios[index] == "2") or (audios[index] == "3"):
                command_a = 'ffmpeg -y -f lavfi -i anullsrc=channel_layout=5.1:sample_rate=48000 -t 60 silence.ac3'
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command_a + ")", shell=True)
                command_a = "ffmpeg -y -t 60 -i " + i + "_audio.wav -i silence.ac3 -filter_complex [0:a][1:a]concat=n=2:v=0:a=1 output.wav"
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command_a + ")", shell=True)

                command_audio = 'ffmpeg -y -i ' + filename.replace(".mp4",
                                                                   "_scaled.mp4") + ' -i output.wav -map 0:0 -map 1:0 -vcodec copy -acodec aac -ab 256k -ar 48000 -ac 2 -shortest ' + filename.replace(
                    ".mp4", "_scaled_changed_audio.mp4")
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command_audio + ")", shell=True)
                final = 'ffmpeg -y -i ' + filename.replace(".mp4",
                                                           "_scaled_changed_audio.mp4") + ' -vcodec copy -acodec copy ' + filename.replace(
                    ".mp4", "_scaled.mp4")
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + final + ")", shell=True)
            elif (audios[index] == "1"):
                command_audio = 'ffmpeg -y -i ' + filename.replace(".mp4",
                                                                   "_scaled.mp4") + ' -i silence.ac3 -map 0:0 -map 1:0 -vcodec copy -acodec aac -ab 256k -ar 48000 -ac 2 -shortest ' + filename.replace(
                    ".mp4", "_scaled_changed_audio.mp4")
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command_audio + ")", shell=True)
                final = 'ffmpeg -y -i ' + filename.replace(".mp4",
                                                           "_scaled_changed_audio.mp4") + ' -vcodec copy -acodec copy ' + filename.replace(
                    ".mp4", "_scaled.mp4")
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + final + ")", shell=True)
            elif (audios[index] == "0"):
                command_audio = 'ffmpeg -y -i ' + filename.replace(".mp4",
                                                                   "_scaled.mp4") + ' -map 0:0 -map 1:0 -vcodec copy -acodec aac -ab 256k -ar 48000 -ac 2 -shortest ' + filename.replace(
                    ".mp4", "_scaled_changed_audio.mp4")
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command_audio + ")", shell=True)
                final = 'ffmpeg -y -i ' + filename.replace(".mp4",
                                                           "_scaled_changed_audio.mp4") + ' -vcodec copy -acodec copy ' + filename.replace(
                    ".mp4", "_scaled.mp4")
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + final + ")", shell=True)

            command = "ffmpeg -y -f lavfi -i anullsrc=channel_layout=5.1:sample_rate=48000 -t 60 silence.ac3"
            subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command + ")", shell=True)

            command_sub = "ffmpeg -y -i " + filename.replace(".mp4",
                                                             "_scaled.mp4") + " -vf 'ass=" + i + ".ass' " + filename.replace(
                ".mp4", "_scaled_sub.mp4")
            subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command_sub + ")", shell=True)
            final = 'ffmpeg -y -i ' + filename.replace(".mp4",
                                                       "_scaled_sub.mp4") + ' -vcodec copy -acodec copy ' + filename.replace(
                ".mp4", "_scaled.mp4")
            subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + final + ")", shell=True)

            if texts[index] == '':
                f.write('file ' + filename.replace(".mp4", "_scaled.mp4") + '\r\n')
            else:
                command_text = 'ffmpeg -y -i ' + filename.replace(".mp4", "_scaled.mp4") + ' -vf drawtext="text=' + \
                               texts[
                                   index] + ':x=(w-text_w)/2:y=10:fontsize=24:fontcolor=white:borderw=2" -c:a copy ' + filename.replace(
                    ".mp4", "_scaled_text.mp4")
                subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command_text + ")", shell=True)
                f.write('file ' + filename.replace(".mp4", "_scaled_text.mp4") + '\r\n')

        f.close()

        command = "ffmpeg -y -f concat -i file.txt -c copy final_file.mp4"
        subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command + ")", shell=True)

        unnecessaryFile = glob.glob("./frontend/"+settings.MEDIA_URL2+"*_scaled*.mp4")
        for file in unnecessaryFile:
            os.remove(file)

    debug.close()

    return HttpResponse("")


def retrieve_videos(request):
    videos = request.GET.get('videos', None)
    audiosToExport = request.GET.get('audios', None)

    videos = videos.split(",")
    audiosToExport = audiosToExport.split(",")
    videosToExport = []
    for i in range(len(videos)):
        videosToExport.append(videos[i]+".mp4")
    subprocess.call("mkdir -p ./frontend/zipvideo", shell=True)
    subprocess.call("rm -rf ./frontend/zipvideo/*", shell=True)
    subprocess.call("cp ./frontend/static/script.jsx ./frontend/zipvideo", shell=True)
    print("VIDEOS")
    print (videos)
    print ("AUDIOSTOEXPORT")
    print (audiosToExport)
    print ("VIDEOSTOEXPORT")
    print (videosToExport)
    createcsv(videosToExport)
    zipstr = ""
    for i in range(len(videosToExport)):
        zipstr += "./" + videosToExport[i] + " "
        subprocess.call("cp ./frontend/"+settings.MEDIA_URL2 + videosToExport[i] + " ./frontend/zipvideo", shell=True)
        if audiosToExport[i] == "2" or audiosToExport[i] == "3":
            subprocess.call("cp ./frontend/" + settings.MEDIA_URL2 + videos[i]+"_audio.wav" + " ./frontend/zipvideo",
                            shell=True)
            zipstr += "./" + videos[i]+"_audio.wav" + " "

    zipstr += " ./videolist.csv ./script.jsx"

    subprocess.call("cd ./frontend/zipvideo && zip video.zip " + zipstr, shell=True)

    return HttpResponse("")

def createcsv(videos):
    csvData = []
    csvData.append(["filename", "dir"])

    for name in videos:
        csvData.append([name, "path"])

    with open(os.path.join("./frontend/zipvideo", "videolist.csv"), "w+") as csvFile:
        writer = csv.writer(csvFile)
        writer.writerows(csvData)

    csvFile.close()

class ShotViewSet(viewsets.ModelViewSet):
    serializer_class = ShotSerializer


    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            shot_id = instance.id
            self.perform_destroy(instance)
        except Http404:
            pass
        return Response(dict(
            id=shot_id,
            request='delete',
            )
        )

    def get_queryset(self):
        queryset = Shot.objects.all()
        queryset = queryset.filter(Q(downloaded=True))

        # id
        id = self.request.query_params.get('id', None)
        if id is not None:
            queryset = queryset.filter(Q(id=id))


        #indoor
        indoor = self.request.query_params.get('indoor', None)
        if indoor is not None:
            if indoor == "0":
                queryset = queryset
            if indoor == "1":
                queryset = queryset.filter(Q(indoor=True))
            if indoor == "2":
                queryset = queryset.filter(Q(indoor=False))

        #word_list = False

        #colourfulness
        color = self.request.query_params.get('colourfulness', None)
        if color is not None:
            queryset = queryset.filter(Q(colourfulness__gte=color))

        #nohappyface
        nhf = self.request.query_params.get('nohappyfaces', None)
        if nhf is not None:
            print (nhf)
            if (nhf == 'true'):
                queryset = queryset.filter(Q(nohappyfaces=True))
            elif (nhf == "false"):
                queryset = queryset.filter(Q(nohappyfaces=False))

        #pixelmotion
        motion = self.request.query_params.get('pixelmotion', None)
        if motion is not None:
            queryset = queryset.filter(Q(pixelmotion__gte=motion))

        #daytime
        daytime = self.request.query_params.get('daytime', None)
        if daytime is not None:
            print (daytime)
            if daytime == "1":
                queryset = queryset.filter(Q(daytime=0))
            elif daytime == "2":
                queryset = queryset.filter(Q(daytime=1))
            else:
                queryset = queryset

        #loudness
        loud = self.request.query_params.get('loudness', None)
        if loud is not None:
            queryset = queryset.filter(Q(loudness__lte=loud))

        #duration
        time = self.request.query_params.get('duration', None)
        if time is not None:
            queryset = queryset.filter(Q(duration__lte=time))

        #text (q)
        q = self.request.query_params.get('q', None)
        if q is not None:
            word_list = [x.strip() for x in q.split(',')]
            if len(word_list) < 2:
                queryset = queryset.filter(
                    Q(video__title__icontains=q) | Q(video__keywords__icontains=q) | Q(keywords__icontains=q))
            else:
                query = functools.reduce(operator.and_, (Q(keywords__icontains=x) for x in word_list))
                queryset = Shot.objects.filter(query)

        #dialogue
        dialogue = self.request.query_params.get('dialogue', None)
        if dialogue is not None:
            if dialogue == "1":
                queryset = queryset.filter(Q(dialogue="True"))
            if dialogue == "2":
                queryset = queryset.filter(Q(dialogue="False"))


        #mood
        mood = self.request.query_params.get('mood', None)
        if mood is not None:
            if mood == '0':
                queryset = queryset
            if mood == '1':
                c1 = (Q(arousal_avg=1) & Q(valence_avg=0))
                c2 = (Q(arousal_avg=1) & Q(valence_avg=1))
                c3 = (Q(arousal_avg=0) & Q(valence_avg=1))
                queryset = queryset.filter(c1 | c2 | c3)

            if mood == '2':
                c1 = Q(arousal_avg=1) & Q(valence_avg=-1)
                c2 = Q(arousal_avg=0) & Q(valence_avg=0)
                c3 = Q(arousal_avg=-1) & Q(valence_avg=1)
                queryset = queryset.filter(c1 | c2 | c3)
            if mood == '3':
                c1 = Q(arousal_avg=-1) & Q(valence_avg=0)
                c2 = Q(arousal_avg=-1) & Q(valence_avg=-1)
                c3 = Q(arousal_avg=0) & Q(valence_avg=-1)
                queryset = queryset.filter(c1 | c2 | c3)
        return queryset

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return VideosSerializer
            #return VideosSerializerNoShots
        if self.action == 'update':
            return VideosSerializer
            #return VideosSerializerNoShots
        if self.action == 'retrieve':
            return VideosSerializer
        if self.action == 'list':
            return VideosSerializer
        return VideosSerializer

class AnnotationViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotationSerializer
    def get_queryset(self):
        queryset = Annotation.objects.all()
        shot_id = self.request.query_params.get('shot_id', None)
        user_id = self.request.query_params.get('user_id', None)
        if shot_id is not None:
            queryset = queryset.filter(Q(shot__id=shot_id))
        if user_id is not None:
            queryset = queryset.filter(Q(user__id=user_id))
        return queryset
