from django.contrib import admin

# Register your models here.
# users/admin.py
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ['email', 'username', 'is_approved']
    list_editable = ['is_approved']
    list_filter = ['is_approved']


admin.site.register(CustomUser, CustomUserAdmin)
