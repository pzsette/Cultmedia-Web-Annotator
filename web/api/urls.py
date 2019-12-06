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
    url(r'^retrieve_videos/$', views.retrieve_videos, name="retrieve_videos"),
    url(r'^get_keywords/$', views.get_keywords, name="get_keywords"),
    url(r'^process_edited_videos/$', views.process_edited_videos, name="process_edited_videos"),#
    url(r'^upload/$', views.upload, name="upload"),#
]
