# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.template import loader
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
from django.shortcuts import render
from django.views.generic import TemplateView
from django.core.files.storage import FileSystemStorage
import requests
from django.conf import settings
from django.core import urlresolvers


def index(request):
    template = loader.get_template('index.html')
    context = {}
    return HttpResponse(template.render(context, request))

def edit_video_view(request):
    template = loader.get_template('edit_video.html')

    context = {

    }
    return HttpResponse(template.render(context,request))

def upload(request):
    context = {}
    if request.method == 'POST':
        uploaded_file = request.FILES["document"]
        print (uploaded_file.name)
        print (uploaded_file.size)
        fs = FileSystemStorage()
        name = fs.save(uploaded_file.name, uploaded_file)
        context['url'] = fs.url(name)

        video_title = request.POST.get('title')
        video_description = request.POST.get('description')
        video_keywords = request.POST.get('keywords')
        video_duration = request.POST.get('duration')
        url = request.build_absolute_uri().replace('/frontend/upload', '')
        video_payload = {'title': video_title, 'description': video_description, 'keywords': video_keywords,
                         'duration': video_duration, 'filename': uploaded_file.name}
        video_post_url = url + 'api/videos/'
        v = requests.post(video_post_url, data=video_payload)
        print (v.json())
        video_id = (v.json()['id'])
        print (video_id)
        shot_payload = {'title': video_title, 'video': video_id, 'filename': uploaded_file.name,
                        'keywords': video_keywords, 'duration': video_duration, 'keywords': video_keywords}
        shot_post_url = url + 'api/shots/'
        requests.post(shot_post_url, data=shot_payload)

    return render(request, 'upload.html', context)
