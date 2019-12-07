# -*- coding: utf-8 -*-
# Generated by Django 1.11.23 on 2019-09-24 10:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0020_auto_20190924_1007'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shot',
            name='end',
        ),
        migrations.AddField(
            model_name='shot',
            name='title',
            field=models.CharField(blank=True, help_text='Shot Title', max_length=30, null=True, verbose_name='Shot Title'),
        ),
    ]
