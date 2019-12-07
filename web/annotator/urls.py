from django.conf.urls import url
from django.conf import settings
from . import views
from django.views.static import serve

urlpatterns = [
     url(r'^$', views.annotator, name='annotator'),
]
