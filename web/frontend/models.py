# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import subprocess
import logging
logger = logging.getLogger(__name__)
from django.contrib.auth import get_user_model
import json
import urllib.request
import requests
from django.conf import settings
from django.db import models
from django.core.validators import URLValidator, MaxValueValidator, MinValueValidator
from django.db.models.signals import post_delete
from django.contrib.sites.models import Site

User = get_user_model()


class Video(models.Model):
    title = models.CharField(u'Video Title', help_text=u'Video Title', blank=True, null=True, max_length=30)
    keywords = models.CharField(u'Video Keywords', help_text=u'Video Keywords', blank=True, null=True, max_length=100)
    description = models.TextField(u'Video Description', help_text=u'Video Description', blank=True, null=True)
    duration = models.CharField(u'Video Duration', help_text=u'Video Duration', blank=True, null=True, max_length=10)
    created = models.DateTimeField(auto_now_add=True)
    uri = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):

        if "videoferracani/" not in self.uri:
            filename = self.uri.split('/')[-1]
            try:
                print("Downloading starts...\n")
                urllib.request.urlretrieve(self.uri, './frontend/videoferracani/' + filename)
                print("Download completed!")
                self.uri = "videoferracani/"+filename
            except Exception as e:
                print(e)
        super(Video, self).save(*args, **kwargs)

    def __str__(self):
        return "%s %s" % (self.title, self.uri)


class Shot(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    title = models.CharField(u'Shot Title', help_text=u'Shot Title', blank=True, null=True, max_length=30)
    thumbnail = models.TextField(blank=True, null=True)
    arousal_avg = models.IntegerField(u'Shot Arousal', help_text=u'Shot Arousal', blank=True, null=True, default=None,
                                      validators=[MaxValueValidator(1), MinValueValidator(-1)])
    valence_avg = models.IntegerField(u'Shot Valence', help_text=u'Shot Valence', blank=True, null=True, default=None,
                                      validators=[MaxValueValidator(1), MinValueValidator(-1)])
    uri = models.TextField(blank=True, null=True)
    processed = models.BooleanField(default=False)

    def save(self,*args, **kwargs):
        if self.thumbnail is None:

            filename = self.uri.split('/')[-1]
            cmd = "ffmpeg -ss 1 -i {q} -vframes 1 {o}".format(q="./videoferracani/" + filename, o="./videoferracani/" +
                                                                                                  filename[:-3] + "jpg")
            subprocess.call("(cd ./frontend/ && " + cmd + ")", shell=True)
            self.thumbnail = "videoferracani/"+filename[:-3] + "jpg"
        super(Shot, self).save(*args, **kwargs)

    def __str__(self):
        return "shot id: " + str(self.id)

    class Meta:
        ordering = ('id',)


class Annotation(models.Model):
    shot = models.ForeignKey(Shot, null=True)
    startAnnotation = models.CharField(u'Annotation Start', help_text=u'Annotation Start', blank=True, null=True,
                                       max_length=10)
    endAnnotation = models.CharField(u'Annotation End', help_text=u'Annotation End', blank=True, null=True,
                                     max_length=10)
    arousal = models.IntegerField(u'Annotation Arousal', help_text=u'Annotation Arousal', blank=True, null=True,
                                  default=None, validators=[MaxValueValidator(10), MinValueValidator(0)])
    valence = models.IntegerField(u'Annotation Valence', help_text=u'Annotation Valence', blank=True, null=True,
                                  default=None, validators=[MaxValueValidator(10), MinValueValidator(0)])
    user = models.ForeignKey(User, null=True)

    def save(self, *args, **kwargs):
        super(Annotation, self).save(*args, **kwargs)
        id = self.shot.id
        print (Site.objects.get_current().domain)
        #FIX THIS
        baseurl="http://0.0.0.0:8000/"
        url = baseurl+"api/annotation?shot_id="+str(id)
        response = urllib.request.urlopen(url)
        str_response = response.read().decode('utf-8')
        obj = json.loads(str_response)

        arousalSum = 0
        valenceSum = 0
        for i in obj["results"]:
            arousalSum += i["arousal"]
            valenceSum += i["valence"]
        arousalAVG = arousalSum / obj["count"]
        valenceAVG = valenceSum / obj["count"]
        print ("arousalAVG " + str(arousalAVG))
        print ("valenceAVG " + str(valenceAVG))

        if arousalAVG < 4:
            arousalAVG = -1
        elif arousalAVG < 7:
            arousalAVG = 0
        else:
            arousalAVG = 1

        if valenceAVG < 4:
            valenceAVG = -1
        elif valenceAVG < 7:
            valenceAVG = 0
        else:
            valenceAVG = 1

        shot_patch_url = baseurl + 'api/shots/' + str(id) + "/"
        shot_payload = {'arousal_avg': arousalAVG, 'valence_avg': valenceAVG}
        requests.patch(shot_patch_url, data=shot_payload)

    def delete(self, *args, **kwargs):

        # FIX THIS
        baseurl = "http://0.0.0.0:8000/"
        super(Annotation, self).delete(*args, **kwargs)
        print ("annotation cancellata")
        id = self.shot.id
        url = baseurl+"api/annotation?shot_id=" + str(id)
        response = urllib.request.urlopen(url)
        str_response = response.read().decode('utf-8')
        obj = json.loads(str_response)

        if obj["count"] == 0:
            print("0 annotationi su questo shot")
            shot_patch_url = baseurl + 'api/shots/' + str(id) + "/"
            shot_payload = {'arousal_avg': "", 'valence_avg': ""}
            requests.patch(shot_patch_url, data=shot_payload)

        else:
            print("sistemo annotazioni rimaste")
            arousalSum = 0
            valenceSum = 0
            for i in obj["results"]:
                print (i["arousal"])
                arousalSum += i["arousal"]
                valenceSum += i["valence"]
            arousalAVG = arousalSum / obj["count"]
            valenceAVG = valenceSum / obj["count"]
            print ("arousalAVG " + str(arousalAVG))
            print ("valenceAVG " + str(valenceAVG))

            if arousalAVG < 4:
                arousalAVG = -1
            elif arousalAVG < 7:
                arousalAVG = 0
            else:
                arousalAVG = 1

            if valenceAVG < 4:
                valenceAVG = -1
            elif valenceAVG < 7:
                valenceAVG = 0
            else:
                valenceAVG = 1

            shot_patch_url = baseurl + 'api/shots/' + str(id) + "/"
            shot_payload = {'arousal_avg': arousalAVG, 'valence_avg': valenceAVG}
            requests.patch(shot_patch_url, data=shot_payload)


