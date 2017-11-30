import django_filters
import json
from django.core.exceptions import PermissionDenied
from rest_framework import viewsets, serializers, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from munigeo import api as munigeo_api
from resources.models import Unit
from resources.api.unit import UnitSerializer
from django.contrib.gis.geos import GEOSGeometry
from resources.api.base import register_view
from hmlvaraus.utils.utils import RelatedOrderingFilter
from hmlvaraus.api.resource import ResourceSerializer

class UnitSerializer(UnitSerializer):
    name = serializers.CharField(required=True)
    resources = ResourceSerializer(read_only=True, many=True)

    def validate(self, data):
        request_user = self.context['request'].user

        # if not request_user.is_staff:
        #     raise PermissionDenied()

        return data

    def to_internal_value(self, data):
        try:
            location = GEOSGeometry(json.dumps(data.get('location')))
        except:
            location = None
            pass

        return {
            'name': data.get('name', {}).get('fi', None),
            'name_fi': data.get('name', {}).get('fi', None),
            'street_address': data.get('street_address', {}).get('fi', None),
            'street_address_fi': data.get('street_address', {}).get('fi', None),
            'location': location,
            'address_zip': data.get('address_zip', None),
            'phone': data.get('phone', None),
            'email': data.get('email', None),
            'description': data.get('description', {}).get('fi', None),
            'description_fi': data.get('description', {}).get('fi', None),
        }

class UnitFilter(django_filters.FilterSet):
    class Meta:
        model = Unit
        fields = []

class StaffWriteOnly(permissions.BasePermission):
     def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or request.user.is_staff

class UnitViewSet(munigeo_api.GeoModelAPIView, viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [StaffWriteOnly]
    filter_class = UnitFilter

    filter_backends = (DjangoFilterBackend,filters.SearchFilter,RelatedOrderingFilter)
    ordering_fields = ('__all__')
    search_fields = ['name', 'name_fi', 'street_address', 'email', 'description', 'phone']

    def perform_create(self, serializer):
        serializer.save()


register_view(UnitViewSet, 'unit')