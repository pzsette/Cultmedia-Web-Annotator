# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.template import loader
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
from django.shortcuts import render
from django.views.generic import TemplateView
from django.core.files.storage import FileSystemStorage
import requests
from django.core import urlresolvers


def index(request):
    template = loader.get_template('index.html')
    context = {}
    return HttpResponse(template.render(context, request))


def upload(request):
    context = {}
    if request.method == 'POST':
        uploaded_file = request.FILES["document"]
        print (uploaded_file.name)
        print (uploaded_file.size)
        fs = FileSystemStorage()
        name = fs.save(uploaded_file.name, uploaded_file)
        context['url'] = fs.url(name)

        video_description = request.POST.get('description')
        video_keywords = request.POST.get('keywords')
        url = request.build_absolute_uri().replace('/frontend/upload', '')
        video_payload = {'title': uploaded_file.name, 'description': video_description, 'keywords': video_keywords,
                         'uri': 'videoferracani/'+uploaded_file.name}
        video_post_url = url + 'api/videos/'
        v = requests.post(video_post_url, data=video_payload)
        video_id = (v.json()['id'])

        shot_payload = {'title': uploaded_file.name, 'video': video_id, 'uri': 'videoferracani/'+uploaded_file.name}
        shot_post_url = url + 'api/shots/'
        s = requests.post(shot_post_url, data=shot_payload)
        print (s.json().id)

    return render(request, 'upload.html', context)
