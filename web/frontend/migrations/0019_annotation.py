# -*- coding: utf-8 -*-
# Generated by Django 1.11.23 on 2019-09-23 14:34
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0018_auto_20190920_0757'),
    ]

    operations = [
        migrations.CreateModel(
            name='Annotation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('startAnnotation', models.CharField(blank=True, help_text='Annotation Start', max_length=10, null=True, verbose_name='Annotation Start')),
                ('endAnnotation', models.CharField(blank=True, help_text='Annotation End', max_length=10, null=True, verbose_name='Annotation End')),
                ('arousal', models.IntegerField(blank=True, default=None, help_text='Annotation Arousal', null=True, validators=[django.core.validators.MaxValueValidator(0), django.core.validators.MinValueValidator(10)], verbose_name='Annotation Arousal')),
                ('valence', models.IntegerField(blank=True, default=None, help_text='Annotation Valence', null=True, validators=[django.core.validators.MaxValueValidator(0), django.core.validators.MinValueValidator(10)], verbose_name='Annotation Valence')),
            ],
        ),
    ]
