# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.template import loader
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage
#from django.shotcut import render
#from .forms import UploadFileForms

def index(request):
    template = loader.get_template('index.html')

    context = {

    }

    # if request.method == 'POST' and request.FILES['upload']:
    #     print ("ahahahahahah")
    #     myfile = request.FILES['upload']
    #     fs = FileSystemStorage()
    #     filename = fs.save(myfile.name, myfile)
    #     uploaded_file_url = fs.url(filename)
    #     print (uploaded_file_url)
    #     return HttpResponse(template.render(context, request))

    return HttpResponse(template.render(context, request))

# def upoload_file(request):
#     if request.method == 'POST':
#             form = UploadFileForm(request.POST, request.FILES)
#             if form.is_valid():
#                 handle_uploaded_file(request.FILES['file'])
#             return HttpResponseRedirect('/success/url/')
#     else:
#         form = UploadFileForm()
#     return render(request, 'upload.html', {'form': form})


