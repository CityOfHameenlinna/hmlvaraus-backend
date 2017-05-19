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
from django_filters.rest_framework import DjangoFilterBackend
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
from hmlvaraus.utils.utils import RelatedOrderingFilter

class BerthSerializer(TranslatedModelSerializer, munigeo_api.GeoModelSerializer):
    resource = ResourceSerializer(required=True)
    width_cm = serializers.IntegerField(required=True)
    depth_cm = serializers.IntegerField(required=True)
    length_cm = serializers.IntegerField(required=True)
    type = serializers.CharField(required=True)
    partial=True

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

    def validate(self, data):
        request_user = self.context['request'].user

        if not request_user.is_staff:
            raise PermissionDenied()

        return data

    def validate_width_cm(self, value):
        if value < 0 or value > 1000:
            raise serializers.ValidationError("Value out of bounds")
        return value

    def validate_height_cm(self, value):
        if value < 0 or value > 1000:
            raise serializers.ValidationError("Value out of bounds")
        return value

    def validate_depth_cm(self, value):
        if value < 0 or value > 1000:
            raise serializers.ValidationError("Value out of bounds")
        return value

    def validate_type(self, value):
        if value not in ['number', 'ground', 'dock']:
            raise serializers.ValidationError("Value out of bounds")
        return value

class BerthFilter(django_filters.FilterSet):
    max_width = django_filters.NumberFilter(name="width_cm", lookup_expr='lte')
    min_width = django_filters.NumberFilter(name="width_cm", lookup_expr='gte')

    max_length = django_filters.NumberFilter(name="length_cm", lookup_expr='lte')
    min_length = django_filters.NumberFilter(name="length_cm", lookup_expr='gte')

    max_depth = django_filters.NumberFilter(name="depth_cm", lookup_expr='lte')
    min_depth = django_filters.NumberFilter(name="depth_cm", lookup_expr='gte')

    unit_id = django_filters.CharFilter(name="resource__unit_id")
    
    class Meta:
        model = Berth
        fields = ['max_width', 'min_width', 'max_length', 'min_length', 'max_depth', 'min_depth', 'unit_id', 'type']

class BerthViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
    queryset = Berth.objects.all().select_related('resource', 'resource__unit')
    serializer_class = BerthSerializer
    lookup_field = 'id'

    filter_class = BerthFilter
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = (DjangoFilterBackend,filters.SearchFilter,RelatedOrderingFilter)
    filter_fields = ['type']
    search_fields = ['type', 'resource__name', 'resource__name_fi', 'resource__unit__name', 'resource__unit__name_fi']
    ordering_fields = ('__all__')

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
