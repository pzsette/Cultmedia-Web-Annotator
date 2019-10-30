from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import requests


class Command(BaseCommand):
    def handle(self, *args, **options):
        '''uriArray = ["http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot1.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot2.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot3.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot4.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot5.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot6.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot7.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot8.mp4"
                    ]'''

        uriArray = ["http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot1.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot2.mp4",
                    "http://micc.unifi.it/ferracani/archive_public/cultmedia-dataset/shared/Museivaticani_shot3.mp4"]

        for i in range(3):
            video_payload = {'title': 'test'+str(i), 'description': 'prova numero: '+str(i), 'keywords': 'test',
                             'duration': 15, 'uri': uriArray[i]}
            video_post_url = 'http://0.0.0.0:8000/api/videos/'
            requests.post(video_post_url, data=video_payload)