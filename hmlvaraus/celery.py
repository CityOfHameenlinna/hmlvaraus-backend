
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
    'cancel_failed_reservations': {
        'task': 'hmlvaraus.tasks.cancel_failed_reservations',
        'schedule': crontab(minute=0, hour=0)
    },
    'check_and_handle_reservation_renewals': {
        'task': 'hmlvaraus.tasks.check_and_handle_reservation_renewals',
        'schedule': crontab(minute=0, hour=12)
    },
}
