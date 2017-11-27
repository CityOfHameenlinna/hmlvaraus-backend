from django.contrib.gis.db import models
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from resources.models import Reservation

class HMLReservation(models.Model):
    berth = models.ForeignKey('Berth', verbose_name=_('Berth'), db_index=True, related_name='hml_reservations', null=True)
    reservation = models.OneToOneField(Reservation, verbose_name=_('Reservation'), db_index=True, on_delete=models.CASCADE)
    is_paid = models.BooleanField(verbose_name=_('Is paid'), default=False)
    reserver_ssn = models.CharField(verbose_name=_('Reserver ssn'), default='', max_length=11)
    state_updated_at = models.DateTimeField(verbose_name=_('Time of modification'), default=timezone.now)
    is_paid_at = models.DateTimeField(verbose_name=_('Time of payment'), null=True, blank=True)
    key_returned = models.BooleanField(verbose_name=_('Key returned'), default=False)
    key_returned_at = models.DateTimeField(verbose_name=_('Time of key returned'), null=True, blank=True)

    def set_paid(self, paid=True):
        if paid:
            self.is_paid = True
            self.is_paid_at = timezone.now()
        else:
            self.is_paid = False
            self.is_paid_at = None

        self.save()

    def get_payment_contact_data(self):
        first_name = ''
        last_name = ''
        name_separated = self.reservation.reserver_name.split(' ')
        if len(name_separated) >= 2:
            first_name = name_separated[0]
            last_name = name_separated[1]
        else:
            first_name = self.reservation.reserver_name
            last_name = self.reservation.reserver_name

        return {
            'telephone': self.reservation.reserver_phone_number,
            'mobile': self.reservation.reserver_phone_number,
            'email': self.reservation.reserver_email_address,
            'first_name': first_name,
            'last_name': last_name,
            'company': '',
            'street': self.reservation.reserver_address_street,
            'postal_code': self.reservation.reserver_address_zip,
            'postal_office': self.reservation.reserver_address_city,
            'country': 'FI',
        }

    def get_payment_product_data(self):
        return {
            'title': self.berth.resource.name + ' (' + self.berth.resource.unit.name + ')',
            'product_id': self.berth.id,
            'amount': 1,
            'price': str(self.berth.price),
            'vat': 24,
            'discount': 0,
            'type': 1,
        }

    def cancel_reservation(self, user):
        if self.reservation.state != Reservation.CANCELLED:
            self.reservation.set_state(Reservation.CANCELLED, user)
            self.state_updated_at = timezone.now()
            self.save()