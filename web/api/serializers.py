from rest_framework import serializers
from frontend.models import Video, Shot, Annotation


class VideosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ('id', 'title', 'description', 'duration', 'uri', 'keywords', 'downloaded')


class ShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shot
        fields = ('id', 'title', 'video', 'thumbnail', 'arousal_avg', 'keywords', 'valence_avg', 'uri', 'indoor',
                  'daytime', 'colourfulness', 'nohappyfaces')


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ('id', 'shot', 'startAnnotation', 'endAnnotation', 'arousal', 'valence', 'user')
