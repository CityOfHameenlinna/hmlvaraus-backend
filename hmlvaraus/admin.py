from helusers.admin import *
from hmlvaraus.models import hml_reservation, berth, sms_message, purchase


class HMLReservationAdmin(admin.ModelAdmin):
    list_display = ('reservation',)

class BerthAdmin(admin.ModelAdmin):
    list_display = ('resource',)

class BerthPriceAdmin(admin.ModelAdmin):
    list_display = ('price',)

class SMSMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'success', 'to_phone_number')

class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'product_name', 'reserver_name', 'purchase_process_started', 'finished')

admin.site.register(hml_reservation.HMLReservation, HMLReservationAdmin)
admin.site.register(berth.Berth, BerthAdmin)
admin.site.register(berth.GroundBerthPrice, BerthPriceAdmin)
admin.site.register(sms_message.SMSMessage, SMSMessageAdmin)
admin.site.register(purchase.Purchase, PurchaseAdmin)