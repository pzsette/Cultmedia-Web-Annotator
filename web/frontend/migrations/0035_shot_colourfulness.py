# -*- coding: utf-8 -*-
# Generated by Django 1.11.25 on 2019-11-01 10:06
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0034_auto_20191031_1810'),
    ]

    operations = [
        migrations.AddField(
            model_name='shot',
            name='colourfulness',
            field=models.DecimalField(decimal_places=4, default=0, max_digits=10, validators=[django.core.validators.MaxValueValidator(1), django.core.validators.MinValueValidator(0)]),
        ),
    ]