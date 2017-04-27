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
from hmlvaraus.api.resource import ResourceSerializer
from hmlvaraus.models.berth import Berth
from resources.models.reservation import RESERVATION_EXTRA_FIELDS
from resources.pagination import ReservationPagination
from users.models import User
from resources.models.utils import generate_reservation_xlsx, get_object_or_none
from resources.api.base import NullableDateTimeField, TranslatedModelSerializer, register_view

class BerthSerializer(TranslatedModelSerializer, munigeo_api.GeoModelSerializer):
    resource = ResourceSerializer(required=True)
    width_cm = serializers.IntegerField()
    depth_cm = serializers.IntegerField()
    length_cm = serializers.IntegerField()
    type = serializers.CharField()

    class Meta:
        model = Berth
        fields = ['width_cm', 'length_cm', 'depth_cm', 'resource', 'type']

    def create(self, validated_data):
        resource_data = validated_data.pop('resource')
        resource = Resource.objects.create(**resource_data)
        berth = Berth.objects.create(resource=resource, **validated_data)
        return berth

    #def to_representation(self, data):
        #print(vars(data))
        #resource = data.pop('resource', None)
        #resource.update(data)
        #return super().to_representation(resource)

class BerthViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
    queryset = Berth.objects.all()
    serializer_class = BerthSerializer

    def perform_create(self, serializer):
        serializer.save()

register_view(BerthViewSet, 'berth')
