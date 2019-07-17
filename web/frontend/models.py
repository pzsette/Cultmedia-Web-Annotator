# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import subprocess
import logging
logger = logging.getLogger(__name__)

import urllib.request

from django.db import models
from django.core.validators import URLValidator, MaxValueValidator, MinValueValidator


class Video(models.Model):
    title = models.CharField(u'Video Title', help_text=u'Video Title', blank=True, null=True, max_length=30)
    keywords = models.CharField(u'Video Keywords', help_text=u'Video Keywords', blank=True, null=True, max_length=100)
    description = models.TextField(u'Video Description', help_text=u'Video Description', blank=True, null=True)
    duration = models.CharField(u'Video Duration', help_text=u'Video Duration', blank=True, null=True, max_length=10)
    created = models.DateTimeField(auto_now_add=True)
    uri = models.TextField(blank=True, null=True)

    def __str__(self):
        return "%s %s" % (self.title, self.uri)

class Shot(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    start = models.CharField(u'Shot Start', help_text=u'Shot Start', blank=True, null=True, max_length=10)
    end = models.CharField(u'Shot End', help_text=u'Shot End', blank=True, null=True, max_length=10)
    thumbnail = models.TextField(blank=True, null=True)
    arousal = models.IntegerField(u'Shot Arousal', help_text=u'Shot Arousal', blank=True, null=True, default=0, validators=[MaxValueValidator(1), MinValueValidator(-1)])
    valence = models.IntegerField(u'Shot Valence', help_text=u'Shot Valence', blank=True, null=True, default=0, validators=[MaxValueValidator(1), MinValueValidator(-1)])
    uri = models.TextField(blank=True, null=True)
    processed = models.BooleanField(default=False)

    def save(self, *args, **kwargs ):
        if self.thumbnail is None:

            filename = self.uri.split('/')[-1]

            try:
                print("Downloading starts...\n")
                urllib.request.urlretrieve(self.uri, './frontend/videoferracani/' + filename)
                print("Download completed..!!")
            except Exception as e:
                print(e)

            print("filename: " + filename)
            print("filename[:-3]: " + filename[:-3])
            cmd = "ffmpeg -ss 1 -i {q} -vframes 1 {o}".format(q="./videoferracani/" + filename, o = "./videoferracani/" + filename[:-3] + "jpg")
            subprocess.call("(cd ./frontend/ && " + cmd + ")", shell=True)
            self.thumbnail = filename[:-3] + "jpg"
        super(Shot, self).save(*args, **kwargs)

    def __str__(self):
        return "shot id: " + str(self.id)

    class Meta:
        ordering = ('id',)