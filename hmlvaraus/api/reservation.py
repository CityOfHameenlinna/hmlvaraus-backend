from rest_framework import serializers
from resources.models import Reservation
from resources.models.reservation import RESERVATION_EXTRA_FIELDS
from resources.api.reservation import ReservationSerializer
from resources.api.base import TranslatedModelSerializer
from hmlvaraus.api.resource import ResourceSerializer

class ReservationSerializer(ReservationSerializer):

    reserver_name = serializers.CharField(required=True)

    class Meta:
        model = Reservation
        fields = ['url', 'id', 'resource', 'user', 'begin', 'end', 'comments', 'is_own', 'state',
                  'need_manual_confirmation', 'staff_event', 'access_code'] + list(RESERVATION_EXTRA_FIELDS)

    def to_representation(self, instance):
        data = super(TranslatedModelSerializer, self).to_representation(instance)
        resource = instance.resource
        user = self.context['request'].user

        # Show the comments field and the user object only for staff
        if not resource.is_admin(user):
            del data['comments']
            del data['user']

        return data

    def validate_reserver_name(self, value):
        if not value :
            raise serializers.ValidationError("Reserver name is required")
        return value