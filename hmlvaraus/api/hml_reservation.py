import uuid
import arrow
import django_filters
import re
import string
from datetime import datetime
from arrow.parser import ParserError
from django.contrib.auth import get_user_model
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, serializers, filters, exceptions, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.fields import BooleanField, IntegerField
from rest_framework import renderers
from rest_framework.exceptions import NotAcceptable, ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from guardian.shortcuts import get_objects_for_user

from helusers.jwt import JWTAuthentication
from munigeo import api as munigeo_api
from resources.models import Reservation, Resource, Unit, ResourceType
from hmlvaraus.api.reservation import ReservationSerializer
from hmlvaraus.api.resource import ResourceSerializer
from hmlvaraus.models.hml_reservation import HMLReservation
from resources.models.reservation import RESERVATION_EXTRA_FIELDS
from resources.pagination import ReservationPagination
from users.models import User
from resources.models.utils import generate_reservation_xlsx, get_object_or_none
from django.http import Http404
from rest_framework.response import Response
from resources.api.base import NullableDateTimeField, TranslatedModelSerializer, register_view

class HMLReservationSerializer(TranslatedModelSerializer, munigeo_api.GeoModelSerializer):
    reservation = ReservationSerializer(required=True)
    is_paid = serializers.BooleanField(required=False)
    reserver_ssn = serializers.CharField(required=False)
    partial = True

    class Meta:
        model = HMLReservation
        fields = ['id', 'is_paid', 'reserver_ssn', 'reservation']

    def create(self, validated_data):
        reservation_data = validated_data.pop('reservation')
        reservation = Reservation.objects.create(**reservation_data)
        hmlReservation = HMLReservation.objects.create(reservation=reservation, **validated_data)
        return hmlReservation

    def to_representation(self, instance):
        data = super(HMLReservationSerializer, self).to_representation(instance)
        return data;

    def validate_reserver_ssn(self, value):

        number_array = re.findall(r'\d+', value[:-1])
        if not number_array or len(value) != 11:
            raise serializers.ValidationError("Social security number not valid")
        ssn_numbers = int(''.join(str(x) for x in number_array))
        test_array = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D',
         'E', 'F', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']

        check_char = test_array[ssn_numbers % 31]

        if not value.endswith(check_char):
            raise serializers.ValidationError("Social security number not valid")
        
        return value

class HMLReservationFilter(django_filters.FilterSet):
    unit_id = django_filters.CharFilter(name="reservation__resource__unit_id")
    begin = django_filters.DateTimeFromToRangeFilter(name="reservation__resource__begin")
    is_paid = django_filters.BooleanFilter(name="is_paid")
    class Meta:
        model = HMLReservation
        fields = ['unit_id', 'is_paid']

class HMLReservationViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
    queryset = HMLReservation.objects.all().select_related('reservation', 'reservation__user', 'reservation__resource', 'reservation__resource__unit')
    serializer_class = HMLReservationSerializer
    lookup_field = 'id'

    filter_class = HMLReservationFilter

    filter_backends = (DjangoFilterBackend,filters.SearchFilter)
    filter_fields = ('reserver_ssn')
    search_fields = ['reserver_ssn', 'reservation__billing_address_street', 'reservation__reserver_email_address', 'reservation__reserver_name']

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        try:
            hml_reservation = self.get_object();
            hml_reservation_id = hml_reservation.reservation.id
            Resource.objects.get(pk=hml_resource_id).delete()
            hml_reservation.delete()
        except Http404:
            pass

        return Response(status=status.HTTP_204_NO_CONTENT)


register_view(HMLReservationViewSet, 'hml_reservation')
