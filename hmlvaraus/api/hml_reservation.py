import arrow
import django_filters
import re
import hashlib
from arrow.parser import ParserError
from django.core.exceptions import PermissionDenied, ImproperlyConfigured, SuspiciousOperation, ValidationError
from django.utils import timezone
from rest_framework import viewsets, serializers, filters, exceptions, permissions, pagination, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from munigeo import api as munigeo_api
from resources.models import Reservation
from hmlvaraus.api.reservation import ReservationSerializer
from hmlvaraus.api.berth import BerthSerializer
from hmlvaraus.models.hml_reservation import HMLReservation
from hmlvaraus.models.purchase import Purchase
from resources.api.base import TranslatedModelSerializer, register_view
from hmlvaraus.utils.utils import RelatedOrderingFilter
from django.utils.translation import ugettext_lazy as _
from hmlvaraus.models.berth import Berth
from resources.models.resource import Resource
from paytrailpayments.payments import *
from rest_framework.views import APIView
from django.conf import settings
from django.http import HttpResponseRedirect
from datetime import timedelta


class HMLReservationSerializer(TranslatedModelSerializer, munigeo_api.GeoModelSerializer):
    reservation = ReservationSerializer(required=True)
    is_paid = serializers.BooleanField(required=False)
    reserver_ssn = serializers.CharField(required=False)
    berth = BerthSerializer(required=True)
    partial = True

    class Meta:
        model = HMLReservation
        fields = ['id', 'berth', 'is_paid', 'reserver_ssn', 'reservation', 'state_updated_at', 'is_paid_at', 'key_returned', 'key_returned_at']

    def validate(self, data):
        request_user = self.context['request'].user
        if self.context['request'].method == 'POST' and Reservation.objects.filter(resource__id=data['reservation']['resource'].id, state=Reservation.CONFIRMED).exists():
            raise serializers.ValidationError(_('Resource is already reserved and scheduled for renewal'))

        if request_user.is_staff and data.get('reservation'):
            two_minutes_ago = timezone.now() - timedelta(minutes=2)
            reservation_data = data.get('reservation')
            resource = reservation_data['resource']
            if resource.berth.reserving and resource.berth.reserving > two_minutes_ago:
                raise serializers.ValidationError(_('Someone is reserving the berth at the moment'))

        return data

    def create(self, validated_data):
        reservation_data = validated_data.pop('reservation')
        if not reservation_data.get('begin') or not reservation_data.get('end'):
            reservation_data['begin'] = timezone.now()
            reservation_data['end'] = timezone.now() + timedelta(years=1)
        reservation = Reservation.objects.create(**reservation_data)
        resource = reservation_data['resource']
        resource.reservable = False
        resource.save()
        validated_data.pop('berth')
        hmlReservation = HMLReservation.objects.create(reservation=reservation, berth=resource.berth, **validated_data)
        return hmlReservation

    def update(self, instance, validated_data):
        if self.context['request'].method == 'PUT':
            return self.update_reservation_info(instance, validated_data)
        elif self.context['request'].method == 'PATCH':
            return self.update_reservation_status(instance, validated_data)

    def update_reservation_info(self, instance, validated_data):
        reservation_data = validated_data.pop('reservation')
        reservation = instance.reservation

        reservation.begin = reservation_data.get('begin', reservation.begin)
        reservation.end = reservation_data.get('end', reservation.end)
        reservation.event_description = reservation_data.get('event_description', reservation.event_description)
        reservation.reserver_name = reservation_data.get('reserver_name', reservation.reserver_name)
        reservation.reserver_email_address = reservation_data.get('reserver_email_address', reservation.reserver_email_address)
        reservation.reserver_phone_number = reservation_data.get('reserver_phone_number', reservation.reserver_phone_number)
        reservation.reserver_address_street = reservation_data.get('reserver_address_street', reservation.reserver_address_street)
        reservation.reserver_address_zip = reservation_data.get('reserver_address_zip', reservation.reserver_address_zip)
        reservation.reserver_address_city = reservation_data.get('reserver_address_city', reservation.reserver_address_city)
        reservation.save()

        return instance

    def update_reservation_status(self, instance, validated_data):
        is_paid = validated_data.get('is_paid')
        if is_paid != None:
            if is_paid:
                instance.is_paid_at = timezone.now()
                instance.is_paid = True

            else:
                instance.is_paid_at = None
                instance.is_paid = False
        key_returned = validated_data.get('key_returned')
        if key_returned != None:
            if key_returned:
                resource = instance.reservation.resource
                resource.reservable = True
                resource.save()
                instance.key_returned_at = timezone.now()
                instance.key_returned = True
            else:
                instance.key_returned_at = None
                instance.key_returned = False

        instance.save()

        return instance

    def to_representation(self, instance):
        data = super(HMLReservationSerializer, self).to_representation(instance)
        return data;

    def validate_reserver_ssn(self, value):
        number_array = re.findall(r'\d+', value[:-1])
        if not number_array or len(value) != 11:
            raise serializers.ValidationError(_('Social security number not valid'))
        ssn_numbers = int(''.join(str(x) for x in number_array))
        test_array = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D',
         'E', 'F', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']

        check_char = test_array[ssn_numbers % 31]

        if not value.endswith(check_char):
            raise serializers.ValidationError(_('Social security number not valid'))
        return value

class PurchaseSerializer(TranslatedModelSerializer, munigeo_api.GeoModelSerializer):
    hml_reservation = HMLReservationSerializer(read_only=True)
    class Meta:
        model = Purchase
        fields = ['id', 'hml_reservation', 'purchase_code', 'reserver_name', 'reserver_email_address', 'reserver_phone_number', 'reserver_address_street', 'reserver_address_zip', 'reserver_address_city', 'vat_percent', 'price_vat', 'product_name', 'purchase_process_started', 'purchase_process_success', 'purchase_process_failure', 'purchase_process_notified']

class HMLReservationFilter(django_filters.FilterSet):
    unit_id = django_filters.CharFilter(name="reservation__resource__unit_id")
    begin = django_filters.DateTimeFromToRangeFilter(name="reservation__resource__begin")
    is_paid = django_filters.BooleanFilter(name="is_paid")
    class Meta:
        model = HMLReservation
        fields = ['unit_id', 'is_paid']

class HMLReservationFilterBackend(filters.BaseFilterBackend):
    """
    Filter reservations by time.
    """

    def filter_queryset(self, request, queryset, view):
        params = request.query_params
        times = {}
        filter_type = 'all';

        if not 'show_cancelled' in params:
            queryset = queryset.exclude(reservation__state='cancelled')

        if 'date_filter_type' in params:
            filter_type = params['date_filter_type'];

        for name in ('begin', 'end'):
            if name not in params:
                continue
            try:
                times[name] = arrow.get(params[name]).to('utc').datetime
            except ParserError:
                raise exceptions.ParseError("'%s' must be a timestamp in ISO 8601 format" % name)
        if filter_type == 'all':
            if times.get('begin', None):
                queryset = queryset.filter(reservation__end__gte=times['begin'])
            if times.get('end', None):
                queryset = queryset.filter(reservation__begin__lte=times['end'])
        elif filter_type == 'begin':
            if times.get('begin', None):
                queryset = queryset.filter(reservation__begin__gte=times['begin'])
            if times.get('end', None):
                queryset = queryset.filter(reservation__begin__lte=times['end'])
        elif filter_type == 'end':
            if times.get('begin', None):
                queryset = queryset.filter(reservation__end__gte=times['begin'])
            if times.get('end', None):
                queryset = queryset.filter(reservation__end__lte=times['end'])

        return queryset

class HMLReservationPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 5000
    def get_paginated_response(self, data):
        next_page = ''
        previous_page = ''
        if self.page.has_next():
            next_page = self.page.next_page_number()
        if self.page.has_previous():
            previous_page = self.page.previous_page_number()
        return Response({
            'next': next_page,
            'previous': previous_page,
            'count': self.page.paginator.count,
            'results': data
        })

class StaffWriteOnly(permissions.BasePermission):
     def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or request.user.is_staff

class HMLReservationViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
    queryset = HMLReservation.objects.all().select_related('reservation', 'reservation__user', 'reservation__resource', 'reservation__resource__unit')
    serializer_class = HMLReservationSerializer
    lookup_field = 'id'
    permission_classes = [StaffWriteOnly]
    filter_class = HMLReservationFilter

    filter_backends = (DjangoFilterBackend,filters.SearchFilter,RelatedOrderingFilter,HMLReservationFilterBackend)
    filter_fields = ('reserver_ssn')
    search_fields = ['reserver_ssn', 'reservation__billing_address_street', 'reservation__reserver_email_address', 'reservation__reserver_name', 'reservation__reserver_phone_number']
    ordering_fields = ('__all__')
    pagination_class = HMLReservationPagination

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        data = self.request._data
        if 'state' in data:
            id = int(self.kwargs.get('id'))
            hml_reservation = HMLReservation.objects.get(pk=id)
            reservation = hml_reservation.reservation
            reservation.set_state(data['state'], self.request.user)
            hml_reservation.state_updated_at = timezone.now()
            hml_reservation.save()
        return serializer.save()

class PurchaseView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        if request.user.is_authenticated():
            PermissionDenied(_('This API is only for non-authenticated users'))
        if not settings.PAYTRAIL_MERCHANT_ID or not settings.PAYTRAIL_MERCHANT_SECRET:
            raise ImproperlyConfigured(_('Paytrail credentials are incorrect or missing'))
        code = request.data.pop('code')
        berth = Berth.objects.get(pk=request.data['berth']['id'])

        if code != hashlib.sha1(str(berth.reserving).encode('utf-8')).hexdigest():
            raise ValidationError(_('Invalid meta data'))

        reservation = request.data['reservation']
        reservation['begin'] = timezone.now()
        reservation['end'] = timezone.now() + timedelta(days=365)
        request.data['reservation'] = reservation

        serializer = HMLReservationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            reservation = serializer.save()
            url = request.build_absolute_uri()
            purchase_code = hashlib.sha1(str(reservation.reservation.created_at).encode('utf-8') + str(reservation.pk).encode('utf-8')).hexdigest()

            contact = PaytrailContact(**reservation.get_payment_contact_data())
            product = PaytrailProduct(**reservation.get_payment_product_data())
            url_set = PaytrailUrlset(success_url=url + '?success=' + purchase_code, failure_url=url + '?failure=' + purchase_code, notification_url=url + '?notification=' + purchase_code)
            purchase = Purchase.objects.create(hml_reservation=reservation, purchase_code=purchase_code, reserver_name=reservation.reservation.reserver_name, reserver_email_address=reservation.reservation.reserver_email_address, reserver_phone_number=reservation.reservation.reserver_phone_number, reserver_address_street=reservation.reservation.reserver_address_street, reserver_address_zip=reservation.reservation.reserver_address_zip, reserver_address_city=reservation.reservation.reserver_address_city, vat_percent=product.get_data()['vat'], price_vat=product.get_data()['price'], product_name=product.get_data()['title'])
            payment = PaytrailPaymentExtended(order_number=purchase.pk, contact=contact, urlset=url_set)
            payment.add_product(product)
            client = PaytrailAPIClient(merchant_id=settings.PAYTRAIL_MERCHANT_ID, merchant_secret=settings.PAYTRAIL_MERCHANT_SECRET)
            
            response = client.initialize_payment(payment)

            if response.url:
                return Response({'redirect': response.url}, status=status.HTTP_200_OK)
            else:
                raise ValidationError(_('Invalid payment data'))
        else:
            print(serializer.errors)
            raise ValidationError(_('Invalid payment data'))

    def get(self, request, format=None):
        if not settings.PAYTRAIL_MERCHANT_ID or not settings.PAYTRAIL_MERCHANT_SECRET:
            raise ImproperlyConfigured(_('Paytrail credentials are incorrect or missing'))
        client = PaytrailAPIClient(merchant_id=settings.PAYTRAIL_MERCHANT_ID, merchant_secret=settings.PAYTRAIL_MERCHANT_SECRET)

        if request.GET.get('success', None):
            if not client.validate_callback_data(request.GET):
                raise ValidationError(_('Checksum failed. Invalid payment.'))
            purchase_code = request.GET.get('success', None)
            purchase = Purchase.objects.get(purchase_code=purchase_code)
            purchase.payment_service_order_number = request.GET.get('ORDER_NUMBER', None)
            purchase.payment_service_timestamp = request.GET.get('TIMESTAMP', None)
            purchase.payment_service_paid = request.GET.get('PAID', None)
            purchase.payment_service_method = request.GET.get('METHOD', None)
            purchase.payment_service_return_authcode = request.GET.get('RETURN_AUTHCODE', None)
            purchase.save()
            purchase.set_success()
            return HttpResponseRedirect('/#purchase/' + purchase_code)
        elif request.GET.get('failure', None):
            if not client.validate_callback_data(request.GET):
                raise ValidationError(_('Checksum failed. Invalid payment.'))
            purchase_code = request.GET.get('failure', None)
            purchase = Purchase.objects.get(purchase_code=purchase_code)
            purchase.payment_service_order_number = request.GET.get('ORDER_NUMBER', None)
            purchase.payment_service_timestamp = request.GET.get('TIMESTAMP', None)
            purchase.payment_service_paid = request.GET.get('PAID', None)
            purchase.payment_service_method = request.GET.get('METHOD', None)
            purchase.payment_service_return_authcode = request.GET.get('RETURN_AUTHCODE', None)
            purchase.save()
            purchase.set_failure()
            purchase.hml_reservation.cancel_reservation(self.request.user)
            return HttpResponseRedirect('/#purchase/' + purchase_code)
        elif request.GET.get('notification', None):
            if not client.validate_callback_data(request.GET):
                raise ValidationError(_('Checksum failed. Invalid payment.'))
            purchase_code = request.GET.get('notification', None)
            purchase = Purchase.objects.get(purchase_code=purchase_code)
            purchase.hml_reservation.set_paid(True)
            purchase.set_notification()
            return Response({}, status=status.HTTP_200_OK)
        elif request.GET.get('code', None):
            purchase_code = request.GET.get('code', None)
            purchase = Purchase.objects.get(purchase_code=purchase_code)
            if purchase.report_is_seen():
                raise PermissionDenied(_('Youre not allowed to see this purchase'))
            serializer = PurchaseSerializer(purchase, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, format=None):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        if body.get('report_seen', None) and body.get('code', None):
            purchase_code = body.get('code', None)
            purchase = Purchase.objects.get(purchase_code=purchase_code)
            purchase.set_report_seen()
            return Response({}, status=status.HTTP_200_OK)

        if body.get('resource', None):
            time = timezone.now()
            berth = Berth.objects.get(resource_id=body.get('resource', None))
            if not berth.reserving or (time - berth.reserving).total_seconds() > 59:
                berth.reserving = time
                berth.save();
            else:
                return Response(None, status=status.HTTP_404_NOT_FOUND)
            return Response({'code': hashlib.sha1(str(berth.reserving).encode('utf-8')).hexdigest()}, status=status.HTTP_200_OK)

        return Response(None, status=status.HTTP_404_NOT_FOUND)

register_view(HMLReservationViewSet, 'hml_reservation')
