import arrow
import django_filters
import re
from arrow.parser import ParserError
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from rest_framework import viewsets, serializers, filters, exceptions, permissions
from django_filters.rest_framework import DjangoFilterBackend
from munigeo import api as munigeo_api
from resources.models import Reservation
from hmlvaraus.api.reservation import ReservationSerializer
from hmlvaraus.models.hml_reservation import HMLReservation
from resources.api.base import TranslatedModelSerializer, register_view
from hmlvaraus.utils.utils import RelatedOrderingFilter
from hmlvaraus import tasks
from datetime import datetime, timedelta
from django.utils.translation import ugettext_lazy as _

class HMLReservationSerializer(TranslatedModelSerializer, munigeo_api.GeoModelSerializer):
    reservation = ReservationSerializer(required=True)
    is_paid = serializers.BooleanField(required=False)
    reserver_ssn = serializers.CharField(required=False)
    partial = True

    class Meta:
        model = HMLReservation
        fields = ['id', 'is_paid', 'reserver_ssn', 'reservation', 'state_updated_at', 'is_paid_at']

    def validate(self, data):
        request_user = self.context['request'].user

        if not request_user.is_staff:
            raise PermissionDenied()

        if Reservation.objects.filter(resource__id=data['reservation']['resource'].id, state=Reservation.CONFIRMED).exists():
            raise serializers.ValidationError(_('Resource is already reserved and scheduled for renewal'))

        return data
    def create(self, validated_data):
        reservation_data = validated_data.pop('reservation')
        try:
            reservation = Reservation.objects.create(**reservation_data)
            hmlReservation = HMLReservation.objects.create(reservation=reservation, **validated_data)
        except:
            raise serializers.ValidationError(_('Invalid reservation data'))
        return hmlReservation

    def update(self, instance, validated_data):
        is_paid = validated_data.get('is_paid')
        if is_paid != None:
            if is_paid:
                validated_data['is_paid_at'] = timezone.now()
            else:
                validated_data['is_paid_at'] = None
        data = super(HMLReservationSerializer, self).update(instance, validated_data);

        return data

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

class HMLReservationViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
    queryset = HMLReservation.objects.all().select_related('reservation', 'reservation__user', 'reservation__resource', 'reservation__resource__unit')
    serializer_class = HMLReservationSerializer
    lookup_field = 'id'
    permission_classes = [permissions.IsAuthenticated]
    filter_class = HMLReservationFilter

    filter_backends = (DjangoFilterBackend,filters.SearchFilter, HMLReservationFilterBackend,RelatedOrderingFilter)
    filter_fields = ('reserver_ssn')
    search_fields = ['reserver_ssn', 'reservation__billing_address_street', 'reservation__reserver_email_address', 'reservation__reserver_name']
    ordering_fields = ('__all__')

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        data = self.request._data
        if 'state' in data:
            id = int(self.kwargs.get('id'))
            hml_reservation = HMLReservation.objects.get(pk=id)
            reservation = hml_reservation.reservation
            reservation.set_state(Reservation.CANCELLED, self.request.user)
            hml_reservation.state_updated_at = timezone.now()
            hml_reservation.save()
        else:
            serializer.save()

register_view(HMLReservationViewSet, 'hml_reservation')
