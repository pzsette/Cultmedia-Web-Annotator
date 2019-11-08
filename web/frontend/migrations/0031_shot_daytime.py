# -*- coding: utf-8 -*-
# Generated by Django 1.11.25 on 2019-10-31 18:07
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0030_shot_indoor'),
    ]

    operations = [
        migrations.AddField(
            model_name='shot',
            name='daytime',
            field=models.IntegerField(default=0, validators=[django.core.validators.MaxValueValidator(2), django.core.validators.MinValueValidator(0)]),
        ),
    ]