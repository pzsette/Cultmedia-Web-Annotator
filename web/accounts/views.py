from django.shortcuts import render

# Create your views here.
# users/views.py
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView

from .forms import CustomUserCreationForm


class SignUp(CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy('login')
    template_name = 'signup.html'


def notApproved(request):
    context = {}
    return render(request, 'notapproved.html', context)
