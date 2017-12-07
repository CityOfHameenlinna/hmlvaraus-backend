
# -*- coding: utf-8 -*-

from datetime import timedelta
from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from hmlvaraus import celery_app as app
from django.contrib.auth.models import AnonymousUser
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from hmlvaraus.sms import send_sms
from django.conf import settings
import hashlib
import time

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

@app.task
def check_and_handle_reservation_renewals():
    from hmlvaraus.models.purchase import HMLReservation
    from resources.models.reservation import Reservation
    now_plus_month = timezone.now() + timedelta(days=30)
    now_plus_week = timezone.now() + timedelta(days=7)
    now_plus_day = timezone.now() + timedelta(days=1)
    reservations = HMLReservation.objects.filter(reservation__end__lte=now_plus_month, reservation__end__gte=timezone.now(), reservation__state=Reservation.CONFIRMED, child=None)
    sent = False

    for reservation in reservations:
        if reservation.reservation.end < now_plus_day:
            if reservation.renewal_notification_day_sent_at:
                continue
            if not reservation.renewal_code:
                reservation.set_renewal_code()
            if reservation.reservation.reserver_email_address:
                sent = True
                send_renewal_email(reservation, 'day')
            if reservation.reservation.reserver_phone_number:
                sent = True
                send_renewal_sms(reservation, 'day')
            if sent:
                reservation.renewal_notification_day_sent_at = timezone.now()
                reservation.save()

        elif reservation.reservation.end < now_plus_week:
            if reservation.renewal_notification_week_sent_at:
                continue
            if not reservation.renewal_code:
                reservation.set_renewal_code()
            if reservation.reservation.reserver_email_address:
                sent = True
                send_renewal_email(reservation, 'week')
            if reservation.reservation.reserver_phone_number:
                sent = True
                send_renewal_sms(reservation, 'week')
            if sent:
                reservation.renewal_notification_week_sent_at = timezone.now()
                reservation.save()
        else:
            if reservation.renewal_notification_month_sent_at:
                continue
            if not reservation.renewal_code:
                reservation.set_renewal_code()
            if reservation.reservation.reserver_email_address:
                sent = True
                send_renewal_email(reservation, 'month')
            if reservation.reservation.reserver_phone_number:
                sent = True
                send_renewal_sms(reservation, 'month')
            if sent:
                reservation.renewal_notification_month_sent_at = timezone.now()
                reservation.save()

def send_renewal_email(reservation, notification_type):
    full_name = reservation.reservation.reserver_name
    recipients = [reservation.reservation.reserver_email_address]
    end_date = reservation.reservation.end
    end_date_finnish = str(end_date.day) + '.' + str(end_date.month) + '.' + str(end_date.year)
    code = reservation.renewal_code
    renewal_link =  'https://varaukset.hameenlinna.fi/#renewal/' + code
    body_html = _('<h2>Hei ' + full_name + ',</h2>\n Venepaikkavarauksesi päättyy ' + end_date_finnish + '. Voit uusia venepaikkavarauksesi alla olevasta linkistä. Mikäli et uusi varaustasi ennen sen päättymistä, venepaikka vapautuu muille varattavaksi. \n \n Uusi venepaikkavarauksesi <a href="' + renewal_link + '"> tästä</a>')
    body_plain = _('Hei ' + full_name + '\n Venepaikkavarauksesi päättyy ' + end_date_finnish + '. Voit uusia venepaikkavarauksesi alla olevasta linkistä. Mikäli et uusi varaustasi ennen sen päättymistä, venepaikka vapautuu muille varattavaksi. \n \n Uusi venepaikkavarauksesi tästä: ' + renewal_link)

    if notification_type == 'month':
        topic = _('Venepaikkavarauksesi päättyy kuukauden päästä. Uusi varauksesi nyt!')
    elif notification_type == 'week':
        topic = _('Venepaikkavarauksesi päättyy viikon päästä. Uusi varauksesi nyt!')
    elif notification_type == 'day':
        topic = _('Venepaikkavarauksesi päättyy tänään. Uusi varauksesi nyt!')

    send_mail(
        topic,
        body_plain,
        settings.EMAIL_FROM,
        recipients,
        html_message=body_html,
        fail_silently=False,
    )

def send_renewal_sms(reservation, notification_type):
    full_name = reservation.reservation.reserver_name
    end_date = reservation.reservation.end
    end_date_finnish = str(end_date.day) + '.' + str(end_date.month) + '.' + str(end_date.year)
    code = reservation.renewal_code
    renewal_link =  'https://varaukset.hameenlinna.fi/#renewal/' + code
    phone_number = str(reservation.reservation.reserver_phone_number)
    if phone_number[0] == '0':
        phone_number = '+358' + phone_number[1:]
    body_plain = _('Hei ' + full_name + '\n\nVenepaikkavarauksesi päättyy ' + end_date_finnish + '. Voit uusia venepaikkavarauksesi alla olevasta linkistä. Mikäli et uusi varaustasi ennen sen päättymistä, venepaikka vapautuu muille varattavaksi. \n\nUusi venepaikkavarauksesi tästä: ' + renewal_link)
    send_sms(phone_number, body_plain)