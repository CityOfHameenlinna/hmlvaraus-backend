import uuid
import arrow
import django_filters
from datetime import datetime
from arrow.parser import ParserError
from django.contrib.auth import get_user_model
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, serializers, filters, exceptions, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.fields import BooleanField, IntegerField
from rest_framework import renderers
from rest_framework.exceptions import NotAcceptable, ValidationError
from guardian.shortcuts import get_objects_for_user

from helusers.jwt import JWTAuthentication
from munigeo import api as munigeo_api
from resources.models import Reservation, Resource, Unit, ResourceType
from resources.models.reservation import RESERVATION_EXTRA_FIELDS
from resources.pagination import ReservationPagination
from resources.api.resource import ResourceSerializer
from users.models import User
from resources.models.utils import generate_reservation_xlsx, get_object_or_none
from hmlvaraus.models.berth import Berth

from resources.api.base import NullableDateTimeField, TranslatedModelSerializer, register_view

class ResourceSerializer(ResourceSerializer):
    #id = serializers.CharField(read_only=True)
    #name = serializers.CharField(max_length=200)
    #name_fi = serializers.CharField(max_length=200)
    name = serializers.CharField(required=True)
    name_fi = serializers.CharField(required=True)
    type_id = serializers.CharField(max_length=100)
    unit_id = serializers.CharField(max_length=50)
    #slug = serializers.CharField(max_length=200)

    #class Meta:
        #model = Resource
        #fields = ['name', 'name_fi', 'type_id', 'unit_id', 'slug']

    def validate(self, data):
        request_user = self.context['request'].user

        if not request_user.is_staff:
            raise PermissionDenied()

        return data

    def validate_name(self, value):
        if not value:
            raise ValidationError('Berth name is required')

    def validate_name_fi(self, value):
        if not value:
            raise ValidationError('Berth name is required')

    def to_internal_value(self, data):
        type_instance = None
        unit_instance = None
        type_id = data.get('type_id', None)

        if type_id != None:
            if not ResourceType.objects.filter(pk=type_id).exists():
                raise ValidationError(dict(access_code=_('Invalid type id')))
            type_instance = ResourceType.objects.get(pk=type_id)
        else:
            types = ResourceType.objects.all();
            for type in types:
                if 'vene' in type.name or 'Vene' in type.name or 'boat' in type.name or 'Boat' in type.name:
                    type_instance = type

        if type_instance == None:
            raise ValidationError(dict(access_code=_('Invalid type id')))

        if not Unit.objects.filter(pk=data.get('unit_id')).exists():
            raise ValidationError(dict(access_code=_('Invalid unit id')))

        unit_instance = Unit.objects.get(pk=data.get('unit_id'))

        return {
            'authentication': 'none',
            'name': data.get('name'),
            'name_fi': data.get('name_fi'),
            'unit': unit_instance,
            'type': type_instance
        }

class ResourceViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer

    def perform_create(self, serializer):
        serializer.save()