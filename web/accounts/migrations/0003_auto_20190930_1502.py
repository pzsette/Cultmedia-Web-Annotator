# -*- coding: utf-8 -*-
# Generated by Django 1.11.23 on 2019-09-30 15:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customuser_is_approved'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='is_approved',
            field=models.BooleanField(default=False, verbose_name='approved'),
        ),
    ]
