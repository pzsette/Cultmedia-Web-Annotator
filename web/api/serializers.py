from rest_framework import serializers
from frontend.models import Video, Shot, Annotation

class VideosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ('id', 'title', 'description', 'duration', 'uri', 'keywords')

class ShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shot
        fields = ('id','title', 'video', 'thumbnail', 'arousal_avg', 'valence_avg','uri')

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ('id','shot', 'startAnnotation', 'endAnnotation','arousal', 'valence', 'user')
