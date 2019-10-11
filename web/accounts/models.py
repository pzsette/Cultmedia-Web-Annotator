from django.db import models
# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.core.mail import EmailMessage
from django.contrib.auth import get_user_model
import smtplib
import ssl


class CustomUser(AbstractUser):
    pass
    # add additional fields in here
    is_approved = models.BooleanField('approved', default=False)

    def __str__(self):
        return self.email


def registered_user(sender, instance, created, **kwargs):
    if created:
        print("New User email: "+instance.email)
        print("New username: "+instance.username)

        message = "Subject: New user registered.\nUser email:" + instance.email + "\nUsername: " + instance.username + "\nGo to cultmedia admin page to approve"

        user = get_user_model()
        admin_email = user.objects.filter(is_superuser=True)[0].email
        email = EmailMessage("Subject: New user registered", message, to=[admin_email])
        email.send()

post_save.connect(registered_user, sender=CustomUser)
