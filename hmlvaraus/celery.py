
# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals
from celery import Celery
from celery.schedules import crontab
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hmlvaraus.settings')
app = Celery('hmlvaraus')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


app.conf.beat_schedule = {
    'retry_sms': {
        'task': 'hmlvaraus.tasks.retry_sms',
        'schedule': crontab(minute=0, hour='11,12,13,15,16')
    },
    'cancel_failed_reservations': {
        'task': 'hmlvaraus.tasks.cancel_failed_reservations',
        'schedule': crontab(minute=0, hour='12')
    },
    'check_and_handle_reservation_renewals': {
        'task': 'hmlvaraus.tasks.check_and_handle_reservation_renewals',
        'schedule': crontab(minute=0, hour='13')
    },
    'check_ended_reservations': {
        'task': 'hmlvaraus.tasks.check_ended_reservations',
        'schedule': crontab(minute=0, hour='14')
    },
    'check_key_returned': {
        'task': 'hmlvaraus.tasks.check_key_returned',
        'schedule': crontab(minute=0, hour='15')
    },
    'check_reservability': {
        'task': 'hmlvaraus.tasks.check_reservability',
        'schedule': crontab(minute=0, hour='*/1')
    },
}
