from rest_framework import serializers
from frontend.models import Video, Shot, Annotation
from django.conf import settings


class VideosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ('id', 'title', 'description', 'duration', 'filename', 'keywords', 'downloaded')


class ShotSerializer(serializers.ModelSerializer):
    media_url = serializers.SerializerMethodField('is_media')

    def is_media(self, foo):
        return settings.MEDIA_URL

    class Meta:
            model = Shot
            fields = ('id', 'title', 'video', 'thumbnail', 'arousal_avg', 'keywords', 'valence_avg', 'filename', 'indoor',
                      'daytime', 'colourfulness', 'nohappyfaces', 'pixelmotion', 'duration', 'loudness', 'dialogue', 'media_url')


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ('id', 'shot', 'startAnnotation', 'endAnnotation', 'arousal', 'valence', 'user')
