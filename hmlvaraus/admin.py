from helusers.admin import *
from hmlvaraus.models import hml_reservation


class HMLReservationAdmin(admin.ModelAdmin):
    list_display = ('reservation',)

admin.site.register(hml_reservation.HMLReservation, HMLReservationAdmin)


