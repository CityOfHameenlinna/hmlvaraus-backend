# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-12-14 09:11
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0049_add_resource_group'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='host_name',
            field=models.CharField(blank=True, max_length=100, verbose_name='Host name'),
        ),
    ]
