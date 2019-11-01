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
import zipfile
from io import BytesIO
import csv
import json
import operator
import functools
from django.core import serializers
from itertools import chain

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

def process_videos(request):
    videos = request.GET.get('videos', None)
    effects = request.GET.get('effects', None)
    command = "ffmpeg -y -f concat -i file.txt -vcodec copy -acodec copy final_file.mp4"
    if videos is not None and effects is not None:
        f = open('./frontend/'+settings.MEDIA_URL2+'file.txt', 'w+')
        print(effects)
        effects = effects.split(",")
        videos = videos.split(",")
        for index, i in enumerate(videos):
            duration = '2'

            fade_in = ''
            fade_out = ''

            if index == 0:
                if effects[index] == '1':
                    fade_out = ',reverse,fade=d=' + duration + ',reverse'
            else:
                if effects[index-1] == '1':
                    fade_in = ',fade=d=' + duration
                if index < len(videos)-1 and effects[index] == '1':
                    fade_out = ',reverse,fade=d=' + duration + ',reverse'

            filename = i.replace("_timeline", "")

            scale_cmd = 'ffmpeg -y -i ' + filename + ' -filter_complex [0:v]scale="480:270",setdar=dar=16/9' + fade_in + fade_out + '[Scaled] -map [Scaled] -map 0:a -r 24 ' + filename.replace(".mp4", "_scaled.mp4")
            subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + scale_cmd + ")", shell=True)

            f.write('file '+filename.replace(".mp4", "_scaled.mp4")+'\r\n')

        f.close()

        print(command)
        subprocess.call("(cd ./frontend/"+settings.MEDIA_URL2+" && " + command + ")", shell=True)

    return HttpResponse("")


def retrieve_videos(request):
    videos = request.GET.get('videos', None)
    videos = videos.split(",")
    subprocess.call("mkdir -p ./frontend/zipvideo", shell=True)
    subprocess.call("rm -rf ./frontend/zipvideo/*", shell=True)
    subprocess.call("cp ./frontend/static/script.jsx ./frontend/zipvideo", shell=True)
    createcsv(videos)
    zipstr = ""
    for i in videos:
        zipstr += "./" + i + " "
        subprocess.call("cp ./frontend/"+settings.MEDIA_URL2 + i + " ./frontend/zipvideo", shell=True)
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


        #indoor
        indoor = self.request.query_params.get('indoor', None)
        if indoor is not None:
            if indoor=="True":
                queryset = queryset.filter(Q(indoor=True))
            if indoor=="False":
                queryset = queryset.filter(Q(indoor=False))

        #word_list = False

        #colourfulness
        color = self.request.query_params.get('colourfulness', None)
        if color is not None:
            queryset = queryset.filter(Q(colourfulness__gte=color))

        #id
        id = self.request.query_params.get('id', None)
        if id is not None:
            queryset = queryset.filter(Q(id=id))

        #nohappyface
        nhf = self.request.query_params.get('nohappyfaces', None)
        if nhf is not None:
            if nhf == "on":
                queryset = queryset.filter(Q(nohappyfaces=True))

        #daytime
        daytime = self.request.query_params.get('daytime', None)
        if daytime is not None:
            print (daytime)
            if daytime == "0":
                queryset = queryset.filter(Q(daytime=0))
            elif daytime == "1":
                queryset = queryset.filter(Q(daytime=1))
            else:
                queryset = queryset

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

        '''queryset = Shot.objects.all()
        q = self.request.query_params.get('q', None)
        print("QUERY")
        print(q)
        word_list = False;
        if q is not None:
            word_list = [x.strip() for x in q.split(',')]
            queryset = queryset.filter(Q(video__title__icontains=q) | Q(video__keywords__icontains=q))
        id = self.request.query_params.get('id', None)
        if id is not None:
            queryset = queryset.filter(Q(id=id))
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
        return queryset'''

    #def update(self):

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

    '''def destroy(self, request, *args, **kwargs):

        try:
            instance = self.get_object()
            video_id = instance.id
            self.perform_destroy(instance)
        except Http404:
            pass
        return Response(dict(
            id=video_id,
            request='delete','''

    #queryset = Video.objects.all()
    #serializer_class = VideosSerializer

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
