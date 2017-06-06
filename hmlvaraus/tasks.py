from __future__ import absolute_import, unicode_literals
import os
from datetime import datetime, timedelta
from django.core.exceptions import ObjectDoesNotExist
from celery import Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'respa.settings')

app = Celery('tasks', broker='amqp://localhost')

@app.task
def set_reservation_renewal(id):
    from hmlvaraus.models.hml_reservation import HMLReservation
    try:
        instance = HMLReservation.objects.get(pk=id)
    except ObjectDoesNotExist:
        return False
    reservation = instance.reservation
    if reservation.state == reservation.CONFIRMED:
        instance.is_paid = False
        instance.save()
        reservation.end = reservation.end + timedelta(days=365)
        reservation.save()

@app.task
def set_reservation_cancel(id):
    from hmlvaraus.models.hml_reservation import HMLReservation
    try:
        instance = HMLReservation.objects.get(pk=id)
    except ObjectDoesNotExist:
        return False
    if not instance.is_paid:
        reservation.state = reservation.CANCELLED
        reservation.save()
