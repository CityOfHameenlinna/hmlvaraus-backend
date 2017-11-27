
# -*- coding: utf-8 -*-

from datetime import timedelta
from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from hmlvaraus import celery_app as app
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

@app.task
def cancel_failed_reservation(purchase_id):
    from hmlvaraus.models.purchase import Purchase
    purchase = Purchase.objects.get(pk=purchase_id)
    if not purchase.is_success() and not purchase.is_finished():
        user = AnonymousUser()
        purchase.hml_reservation.cancel_reservation(user)
        purchase.set_finished()

@app.task
def cancel_failed_reservations():
    from hmlvaraus.models.purchase import Purchase
    three_days_ago = timezone.now() - timedelta(days=3)
    failed_purchases = Purchase.objects.filter(created_at__lte=three_days_ago, purchase_process_notified__isnull=True, finished__isnull=True)
    user = AnonymousUser()
    for purchase in failed_purchases:
        purchase.hml_reservation.cancel_reservation(user)
        purchase.set_finished()