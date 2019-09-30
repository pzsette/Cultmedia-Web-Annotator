from django.db import models
# Create your models here.
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    pass
    # add additional fields in here
    is_approved = models.BooleanField('approved', default=False)

    def __str__(self):
        return self.email
