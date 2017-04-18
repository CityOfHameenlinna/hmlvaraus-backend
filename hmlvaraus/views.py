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
from resources.models import Reservation, Resource, Unit
from resources.models.reservation import RESERVATION_EXTRA_FIELDS
from resources.pagination import ReservationPagination
from users.models import User
from resources.models.utils import generate_reservation_xlsx, get_object_or_none

from resources.api.base import NullableDateTimeField, TranslatedModelSerializer, register_view

class ResourceCreationSerializer(serializers.Serializer):
	id = serializers.CharField(read_only=True)
	name = serializers.CharField(max_length=200)
	name_fi = serializers.CharField(max_length=200)
	type_id = serializers.CharField(max_length=100)
	unit_id = serializers.CharField(max_length=50)
	slug = serializers.CharField(max_length=200)

	def create(self, validated_data):
		return Resource.objects.create(**validated_data)

class ResourceCreationViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
	queryset = Resource.objects.all()
	serializer_class = ResourceCreationSerializer

	def perform_create(self, serializer):
		serializer.save()


register_view(ResourceCreationViewSet, 'resource_creation')