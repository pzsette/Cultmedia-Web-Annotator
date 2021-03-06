# -*- coding: utf-8 -*-
# Generated by Django 1.11.20 on 2019-05-14 14:38
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0005_remove_video_video_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='thumbnail',
            field=models.ImageField(default=None, upload_to=b''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='video',
            name='video_url',
            field=models.FileField(default=None, upload_to=b''),
            preserve_default=False,
        ),
    ]
