# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2018-04-10 10:37
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('hmlvaraus', '0021_auto_20180323_0939'),
    ]

    operations = [
        migrations.CreateModel(
            name='SMSMessage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Time of creation')),
                ('modified_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Time of modification')),
                ('message_body', models.TextField()),
                ('to_phone_number', models.CharField(blank=True, max_length=30, verbose_name='Reserver phone number')),
                ('success', models.BooleanField(default=False)),
                ('twilio_id', models.CharField(blank=True, max_length=100)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='smsmessage_created', to=settings.AUTH_USER_MODEL, verbose_name='Created by')),
                ('hml_reservation', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, related_name='sms_messages', to='hmlvaraus.HMLReservation', verbose_name='Reservation')),
                ('modified_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='smsmessage_modified', to=settings.AUTH_USER_MODEL, verbose_name='Modified by')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
