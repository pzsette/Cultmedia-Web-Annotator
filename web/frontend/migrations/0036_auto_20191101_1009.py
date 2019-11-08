# -*- coding: utf-8 -*-
# Generated by Django 1.11.25 on 2019-11-01 10:09
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0035_shot_colourfulness'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shot',
            name='colourfulness',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5, validators=[django.core.validators.MaxValueValidator(1), django.core.validators.MinValueValidator(0)]),
        ),
    ]