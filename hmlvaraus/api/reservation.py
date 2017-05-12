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
from resources.api.reservation import ReservationSerializer
from users.models import User
from resources.models.utils import generate_reservation_xlsx, get_object_or_none
from hmlvaraus.models.berth import Berth

from resources.api.base import NullableDateTimeField, TranslatedModelSerializer, register_view

class ReservationSerializer(ReservationSerializer):

    class Meta:
        model = Reservation
        fields = ['url', 'id', 'resource', 'user', 'begin', 'end', 'comments', 'is_own', 'state',
                  'need_manual_confirmation', 'staff_event', 'access_code'] + list(RESERVATION_EXTRA_FIELDS)

    def to_representation(self, instance):
        data = super(TranslatedModelSerializer, self).to_representation(instance)
        resource = instance.resource
        user = self.context['request'].user

        if self.context['request'].accepted_renderer.format == 'xlsx':
            # Return somewhat different data in case we are dealing with xlsx.
            # The excel renderer needs datetime objects, so begin and end are passed as objects
            # to avoid needing to convert them back and forth.
            data.update(**{
                'unit': resource.unit.name,  # additional
                'resource': resource.name,  # resource name instead of id
                'begin': instance.begin,  # datetime object
                'end': instance.end,  # datetime object
                'user': instance.user.email,  # just email
                'created_at': instance.created_at
            })

        # Show the comments field and the user object only for staff
        if not resource.is_admin(user):
            del data['comments']
            del data['user']

        return data