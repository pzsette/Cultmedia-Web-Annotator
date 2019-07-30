from rest_framework import serializers
from frontend.models import Video, Shot

class VideosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ('id', 'title', 'description', 'duration', 'uri', 'keywords')

class ShotSerializer(serializers.ModelSerializer):
    #video = VideosSerializer(many=False, read_only=True)
    class Meta:
        model = Shot
        fields = ('id','title', 'video', 'start', 'end', 'thumbnail', 'arousal', 'valence','uri')