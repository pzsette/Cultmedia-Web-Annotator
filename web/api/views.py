from __future__ import unicode_literals
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse
from rest_framework import generics
from django.db.models import Q
import subprocess
from frontend.models import Video, Shot, Annotation
from rest_framework import viewsets
from .serializers import VideosSerializer, AnnotationSerializer, ShotSerializer
import os
import zipfile
#import StringIO

def process_videos(request):
    videos = request.GET.get('videos', None)
    effects = request.GET.get('effects', None)
    command = "ffmpeg -y -f concat -i file.txt -vcodec copy -acodec copy final_file.mp4"
    if videos is not None and effects is not None:
        f = open('./frontend/videoferracani/file.txt', 'w+')
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
            subprocess.call("(cd ./frontend/videoferracani/ && " + scale_cmd + ")", shell=True)

            f.write('file '+filename.replace(".mp4", "_scaled.mp4")+'\r\n')

        f.close()

        print(command)
        subprocess.call("(cd ./frontend/videoferracani/ && " + command + ")", shell=True)

    return HttpResponse("")


def retrieve_videos(request):
    print ("dentro richiesta")
    videos = request.GET.get('videos', None)
    print (videos)
    # Files (local path) to put in the .zip

    filenames = []
    videos = videos.split(",")
    for i in videos:
        filenames.append("./frontend/videoferracani/"+i)
    print (filenames);
    # Folder name in ZIP archive which contains the above files
    # E.g [thearchive.zip]/somefiles/file2.txt
    # FIXME: Set this to something better
    zip_subdir = "video"
    zip_filename = "%s.zip" % zip_subdir

    # Open StringIO to grab in-memory ZIP contents
    s = StringIO.StringIO()

    # The zip compressor
    zf = zipfile.ZipFile(s, "w")

    for fpath in filenames:
        # Calculate path for file in zip
        fdir, fname = os.path.split(fpath)
        zip_path = os.path.join(zip_subdir, fname)

        # Add file, at correct path
        zf.write(fpath, zip_path)

    # Must close zip for all contents to be written
    zf.close()

    # Grab ZIP file from in-memory, make response with correct MIME-type
    resp = HttpResponse(s.getvalue(), mimetype="application/x-zip-compressed")
    # ..and correct content-disposition
    resp['Content-Disposition'] = 'attachment; filename=%s' % zip_filename

    return resp



class ShotViewSet(viewsets.ModelViewSet):
    serializer_class = ShotSerializer
    def get_queryset(self):
        queryset = Shot.objects.all()
        q = self.request.query_params.get('q', None)
        if q is not None:
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
        return queryset

    #def update(self):


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideosSerializer

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
