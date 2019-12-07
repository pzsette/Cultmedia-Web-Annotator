from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import requests


class Command(BaseCommand):
    def handle(self, *args, **options):
        print (settings.BASE_DIR)
