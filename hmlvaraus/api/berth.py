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
from rest_framework import viewsets, serializers, filters, exceptions, permissions, status
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
from django.http import Http404
from rest_framework.response import Response
from resources.api.base import NullableDateTimeField, TranslatedModelSerializer, register_view

class BerthSerializer(TranslatedModelSerializer, munigeo_api.GeoModelSerializer):
    resource = ResourceSerializer(required=True)
    width_cm = serializers.IntegerField()
    depth_cm = serializers.IntegerField()
    length_cm = serializers.IntegerField()
    type = serializers.CharField()

    class Meta:
        model = Berth
        fields = ['id', 'width_cm', 'length_cm', 'depth_cm', 'resource', 'type']

    def create(self, validated_data):
        resource_data = validated_data.pop('resource')
        resource = Resource.objects.create(**resource_data)
        berth = Berth.objects.create(resource=resource, **validated_data)
        return berth

    def update(self, instance, validated_data):
        resource_data = validated_data.pop('resource')
        
        resource = instance.resource

        print(vars(resource))

        instance.width_cm = validated_data.get('width_cm', instance.width_cm)
        instance.depth_cm = validated_data.get('depth_cm', instance.depth_cm)
        instance.length_cm = validated_data.get('length_cm', instance.length_cm)
        instance.type = validated_data.get('type', instance.type)
        instance.save()

        new_resource_name = resource_data.get('name')

        resource.name_fi = new_resource_name.get('fi', resource.name_fi)
        resource.name_sv = new_resource_name.get('fi', resource.name_fi)
        resource.name_en = new_resource_name.get('fi', resource.name_fi)
        resource.name = new_resource_name.get('fi', resource.name_fi)
        resource.unit_id = resource_data.get('unit_id', resource.unit_id)
        resource.save()

        return instance

    def to_representation(self, instance):
        data = super(BerthSerializer, self).to_representation(instance)
        return data;

class BerthViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
    queryset = Berth.objects.all().select_related('resource', 'resource__unit')
    serializer_class = BerthSerializer
    lookup_field = 'id'

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):

        try:
            berth = self.get_object();
            resource_id = berth.resource.id
            resource = Resource.objects.get(pk=resource_id).delete()
            try:
                reservations = Reservation.objects.get(resource=resource).delete()
            except:
                pass
            berth.delete()
        except Http404:
            pass

        return Response(status=status.HTTP_204_NO_CONTENT)


register_view(BerthViewSet, 'berth')
