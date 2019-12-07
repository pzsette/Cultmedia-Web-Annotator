# -*- coding: utf-8 -*-
# Generated by Django 1.11.22 on 2019-07-29 23:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0015_shot_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shot',
            name='title',
            field=models.CharField(blank=True, help_text='Shot Title', max_length=30, null=True, verbose_name='Shot Title'),
        ),
    ]
