# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2018-04-27 06:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hmlvaraus', '0025_berth_reserving_staff_member'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hmlreservation',
            name='state_updated_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Time of modification'),
        ),
    ]