
# -*- coding: utf-8 -*-

from datetime import timedelta

from rest_framework.filters import OrderingFilter

from django.core.exceptions import FieldDoesNotExist
from django.db.models.fields.reverse_related import ForeignObjectRel, OneToOneRel
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from hmlvaraus import tasks
from hmlvaraus.models.hml_reservation import HMLReservation
from resources.models.reservation import Reservation
from hmlvaraus.models.purchase import Purchase

@receiver(post_save, sender=Purchase)
def set_reservation_renew(sender, instance, **kwargs):
    if kwargs.get('created'):
        cancel_eta = timezone.now() + timedelta(minutes=20)
        tasks.cancel_failed_reservation.apply_async((instance.id,), eta=cancel_eta)


def send_initial_renewal_notifications():
    reservations = HMLReservation.objects.filter(reservation__begin='2017-11-30 22:00:00+00:00', reservation__end='2018-05-31 21:00:00+00:00', reservation__state=Reservation.CONFIRMED, child=None)
    for reservation in reservations:
        tasks.send_initial_renewal_notification.delay((reservation.id,))


class RelatedOrderingFilter(OrderingFilter):
    """
    Extends OrderingFilter to support ordering by fields in related models.
    """

    def is_valid_field(self, model, field):
        """
        Return true if the field exists within the model (or in the related
        model specified using the Django ORM __ notation)
        """
        components = field.split('__', 1)
        try:

            field = model._meta.get_field(components[0])

            if isinstance(field, OneToOneRel):
                return self.is_valid_field(field.related_model, components[1])

            # reverse relation
            if isinstance(field, ForeignObjectRel):
                return self.is_valid_field(field.model, components[1])

            # foreign key
            if field.rel and len(components) == 2:
                return self.is_valid_field(field.rel.to, components[1])
            return True
        except FieldDoesNotExist:
            return False

    def remove_invalid_fields(self, queryset, fields, view, foo):
        return [term for term in fields
                if self.is_valid_field(queryset.model, term.lstrip('-'))]
