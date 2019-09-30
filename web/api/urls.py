from django.conf.urls import url, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'shots', views.ShotViewSet, 'shots')
router.register(r'videos', views.VideoViewSet, 'videos')
router.register(r'annotation', views.AnnotationViewSet, 'annotation')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^process_videos/$', views.process_videos, name="process_videos"),
]