# Generated by Django 2.2.2 on 2019-06-13 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0010_shot_uri'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='keywords',
            field=models.CharField(blank=True, help_text='Video Keywords', max_length=100, null=True, verbose_name='Video Keywords'),
        ),
    ]
