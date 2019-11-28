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
from django.db.models.signals import post_save
from django.contrib.sites.models import Site

User = get_user_model()

class Video(models.Model):
    title = models.CharField(u'Video Title', help_text=u'Video Title', blank=True, null=True, max_length=50)
    keywords = models.CharField(u'Video Keywords', help_text=u'Video Keywords', blank=True, null=True, max_length=100)
    description = models.TextField(u'Video Description', help_text=u'Video Description', blank=True, null=True)
    duration = models.CharField(u'Video Duration', help_text=u'Video Duration', blank=True, null=True, max_length=10)
    created = models.DateTimeField(auto_now_add=True)
    filename = models.TextField(blank=True, null=True)
    web_uri = models.TextField(blank=True, null=True)
    downloaded = models.BooleanField(default=False)

    #def save(self, *args, **kwargs):
    #    if settings.MEDIA_URL2 not in self.uri:
    #        self.web_uri = self.uri
    #        filename = self.uri.split('/')[-1]
    #        self.uri = settings.MEDIA_URL2 + filename
    #    super(Video, self).save(*args, **kwargs)

    '''if settings.MEDIA_URL2 not in self.uri:
        filename = self.uri.split('/')[-1]
        try:
            print("Downloading starts...")
            urllib.request.urlretrieve(self.uri, './frontend/'+settings.MEDIA_URL2 + filename)
            print("Download completed!")
            self.uri = settings.MEDIA_URL2+filename
            print (self.uri)
            if ".mp4" not in self.uri:
                newfilename = filename[:-3]+"mp4"
                cmd = "ffmpeg -i "+filename+" "+newfilename
                subprocess.call("cd ./frontend/"+settings.MEDIA_URL2+" && " + cmd, shell=True)
                subprocess.call("cd ./frontend/"+settings.MEDIA_URL2+" && rm "+filename, shell=True)
                self.uri = settings.MEDIA_URL2 + newfilename
        except Exception as e:
            print(e)'''

    def delete(self, *args, **kwargs):
        filename = self.uri.split('/')[-1]
        subprocess.call("cd ./frontend/"+settings.MEDIA_URL2+" && rm "+filename, shell=True)
        super(Video, self).delete(*args, **kwargs)

    def __str__(self):
        return "%s %s" % (self.title, self.filename)

def addedVideo (sender, instance, created, **kwargs):
    if not instance:
        return
     #uso attributo dirty per evitare ricorsione di save()
    if hasattr(instance, '_dirty'):
        return

    print(instance.web_uri)
    if instance.web_uri is not None:
        if settings.MEDIA_URL2 not in instance.web_uri:
            try:
                filename = instance.uri.split('/')[-1]
                print("Downloading starts...")
                urllib.request.urlretrieve(instance.web_uri, './frontend/' + settings.MEDIA_URL2 + filename)
                print("Download completed!")

                print (instance.uri)
                if ".mp4" not in instance.uri:
                    newfilename = filename[:-3] + "mp4"
                    cmd = "ffmpeg -i " + filename + " " + newfilename
                    subprocess.call("cd ./frontend/" + settings.MEDIA_URL2 + " && " + cmd, shell=True)
                    subprocess.call("cd ./frontend/" + settings.MEDIA_URL2 + " && rm " + filename, shell=True)
                    instance.uri = settings.MEDIA_URL2 + newfilename
            except Exception as e:
                print(e)
    instance.downloaded = True
    try:
        instance._dirty = True
        instance.save()
    finally:
        del instance._dirty


#post_save.connect(addedVideo, sender=Video)


class Shot(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    title = models.CharField(u'Shot Title', help_text=u'Shot Title', blank=True, null=True, max_length=30)
    thumbnail = models.TextField(blank=True, null=True, default=None)
    arousal_avg = models.IntegerField(u'Shot Arousal', help_text=u'Shot Arousal', blank=True, null=True, default=None,
                                      validators=[MaxValueValidator(1), MinValueValidator(-1)])
    valence_avg = models.IntegerField(u'Shot Valence', help_text=u'Shot Valence', blank=True, null=True, default=None,
                                      validators=[MaxValueValidator(1), MinValueValidator(-1)])
    filename = models.TextField(blank=True, null=True)

    keywords = models.CharField(u'Shot Keywords', help_text=u'Shot Keywords', blank=True, null=True, max_length=100,
                                default=None)
    processed = models.BooleanField(default=False)
    web_uri = models.TextField(blank=True, null=True)
    downloaded = models.BooleanField(default=False)

    #Other params#
    indoor = models.BooleanField(default=False)

    daytime = models.IntegerField(blank=True, null=True, default=None, validators=[MaxValueValidator(1),
                                                                                   MinValueValidator(0)])
    #0->day  1->night
    colourfulness = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MaxValueValidator(1),
                                                                                               MinValueValidator(0)])

    nohappyfaces = models.BooleanField(default=False)

    pixelmotion = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MaxValueValidator(1),
                                                                                              MinValueValidator(0)])

    duration = models.CharField(u'Shot Duration', help_text=u'Shot Duration', blank=True, null=True, max_length=5)

    loudness = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MaxValueValidator(1),
                                                                                             MinValueValidator(0)])

    dialogue = models.BooleanField(default=False)


    #def save(self, *args, **kwargs):
    #   if settings.MEDIA_URL2 not in self.uri:
    #       self.web_uri = self.uri
    #        filename = self.uri.split('/')[-1]
    #        self.uri = settings.MEDIA_URL2 + filename
    #    else:
    #        self.downloaded = True
    '''if self.thumbnail is None:
        filename = self.uri.split('/')[-1]
        cmd = "ffmpeg -ss 1 -i {q} -vframes 1 {o}".format(q="./"+settings.MEDIA_URL2 + filename, o="./"+settings.MEDIA_URL2+
                                                                                              filename[:-3] + "jpg")
        subprocess.call("(cd ./frontend/ && " + cmd + ")", shell=True)
        self.thumbnail = settings.MEDIA_URL2+filename[:-3] + "jpg"'''
    #    super(Shot, self).save(*args, **kwargs)

    def __str__(self):
        return "shot id: " + str(self.id)

    def delete(self, *args, **kwargs):
        filename = self.uri.split('/')[-1]
        filethumb = filename[:-3] + "jpg"
        fileaudio = filename[:-4] + "_audio.wav"
        subprocess.call("cd ./frontend/"+settings.MEDIA_URL2+" && rm "+filename + "&& rm "+filethumb+" && rm "+fileaudio, shell=True)
        super(Shot, self).delete(*args, **kwargs)

    class Meta:
        ordering = ('id',)

def addedShot (sender, instance, created, **kwargs):
    filename = instance.uri.split('/')[-1]
    if not instance:
        return
    #uso attributo dirty per evitare ricorsione di save()
    if hasattr(instance, '_dirty'):
        return
    if instance.downloaded is False:
        if settings.MEDIA_URL2 not in instance.web_uri:
            try:
                filename = instance.uri.split('/')[-1]
                print("Downloading starts...")
                urllib.request.urlretrieve(instance.web_uri, './frontend/' + settings.MEDIA_URL2 + filename)
                print("Download completed!")

                print (instance.uri)
                if ".mp4" not in instance.uri:
                    newfilename = filename[:-3] + "mp4"
                    cmd = "ffmpeg -i " + filename + " " + newfilename
                    subprocess.call("cd ./frontend/" + settings.MEDIA_URL2 + " && " + cmd, shell=True)
                    subprocess.call("cd ./frontend/" + settings.MEDIA_URL2 + " && rm " + filename, shell=True)
                    instance.uri = settings.MEDIA_URL2 + newfilename
            except Exception as e:
                print(e)
    instance.downloaded = True
    if ".jpg" not in instance.thumbnail:
        newfilename = instance.uri.split('/')[-1]
        cmd = "ffmpeg -ss 1 -i {q} -vframes 1 {o}".format(q="./" + settings.MEDIA_URL2 + newfilename,
                                                          o="./" + settings.MEDIA_URL2 +
                                                            filename[:-3] + "jpg")
        subprocess.call("(cd ./frontend/ && " + cmd + ")", shell=True)
        instance.thumbnail = settings.MEDIA_URL2 + filename[:-3] + "jpg"
    try:
        instance._dirty = True
        instance.save()
    finally:
        del instance._dirty

#post_save.connect(addedShot, sender=Shot)

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

        # CHANGE IN /admin/sites/site
        baseurl = Site.objects.get_current().domain
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

        shot_patch_url = baseurl + 'api/shots/' + str(id)+'/'
        shot_payload = {'arousal_avg': arousalAVG, 'valence_avg': valenceAVG}
        requests.patch(shot_patch_url, data=shot_payload)

    def delete(self, *args, **kwargs):

        # CHANGE IN /admin/sites/site
        baseurl = Site.objects.get_current().domain
        super(Annotation, self).delete(*args, **kwargs)
        print ("annotation cancellata")
        id = self.shot.id
        url = baseurl+"api/annotation?shot_id=" + str(id)
        response = urllib.request.urlopen(url)
        str_response = response.read().decode('utf-8')
        obj = json.loads(str_response)

        if obj["count"] == 0:
            print("0 annotationi su questo shot")
            shot_patch_url = baseurl + 'api/shots/?id=' + str(id)
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

            shot_patch_url = baseurl + 'api/shots/'+str(id)+'/'
            shot_payload = {'arousal_avg': arousalAVG, 'valence_avg': valenceAVG}
            print (arousalAVG)
            print (valenceAVG)
            requests.patch(shot_patch_url, data=shot_payload)
