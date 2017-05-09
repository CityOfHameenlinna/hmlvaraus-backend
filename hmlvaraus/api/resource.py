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

        #if not Unit.objects.filter(pk=data['unit']).exists():
        #    raise ValidationError(dict(access_code=_('Invalid unit id')))

        #if not ResourceType.objects.filter(pk=data['type']).exists():
        #    raise ValidationError(dict(access_code=_('Invalid type id')))

        return data

    def to_internal_value(self, data):
        unit_instance = Unit.objects.get(pk=data.get('unit_id'))
        type_instance = ResourceType.objects.get(pk=data.get('type_id'))

        return {
            #'slug': data.get('slug'),
            'authentication': data.get('authentication'),
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