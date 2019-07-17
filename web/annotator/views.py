# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse

def annotator(request):
     context = {
     }
     return render(request, "annotator.html", context)



