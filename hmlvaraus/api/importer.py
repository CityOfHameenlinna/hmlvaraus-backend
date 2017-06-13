import json
import datetime
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from rest_framework import permissions, generics
from resources.models import Unit, Reservation, Resource, ResourceType
from hmlvaraus.models.hml_reservation import HMLReservation
from hmlvaraus.models.berth import Berth
from django.contrib.gis.geos import GEOSGeometry
from rest_framework import status
from rest_framework.response import Response

class ImporterView(generics.CreateAPIView):
    base_name = 'importer'
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request_user = request.user

        if not request_user.is_staff:
            raise PermissionDenied()

        uploaded_file = request.data['file']
        data = uploaded_file.read().decode("utf-8")

        data_rows = data.split('\n')
        del data_rows[0]
        for row in data_rows:
            fields = row.split(';')
            if len(fields) == 7: 
                print('Kohdedataa')
                location = fields[5].split(',')
                coordinates = []
                for coord in location:
                    coord = coord.strip()
                    coord = float(coord)
                    coordinates = [coord] + coordinates

                location = json.dumps({'type': 'Point', 'coordinates': coordinates})
                Unit.objects.get_or_create(name=fields[0], street_address=fields[1], address_zip=fields[2], email=fields[3], phone=fields[4], location=GEOSGeometry(location), description=fields[6])
            elif len(fields) == 9:
                print('Venepaikkadataa')
                unit = Unit.objects.get(name=fields[0]);

                resource_types = ResourceType.objects.all();
                for resource_type in resource_types:
                    if 'vene' in resource_type.name.lower() or 'boat' in resource_type.name.lower():
                        type_instance = resource_type

                resource = Resource.objects.get_or_create(unit=unit, name=fields[1], description=fields[2], type=type_instance)[0]
                is_disabled = False
                if fields[3] == 'kyllä':
                    is_disabled = True
                price = 0
                if fields[4]:
                    price = fields[4].replace(',', '.')
                    price = float(price)

                type_mapping = {
                    'numero': 'number',
                    'laituri': 'dock',
                    'poletti': 'ground'
                }

                berth_type = type_mapping.get(fields[8], None)
                Berth.objects.get_or_create(resource=resource, is_disabled=is_disabled, price=price, length_cm=int(fields[5]), width_cm=int(fields[6]), depth_cm=int(fields[7]), type=berth_type)
            elif len(fields) == 12:
                print('Varausdataa')
                unit = Unit.objects.get(name=fields[1])
                resource = Resource.objects.get(unit=unit, name=fields[0])
                begin = datetime.datetime.strptime(fields[2], "%d.%m.%Y %H:%M")
                end = datetime.datetime.strptime(fields[3], "%d.%m.%Y %H:%M")
                state = 'confirmed'
                state_updated_at = timezone.now()
                is_paid = False
                is_paid_at = None
                if fields[5] and fields[5].strip() != '':
                    state_updated_at = datetime.datetime.strptime(fields[5], "%d.%m.%Y %H:%M")
                    state = 'cancelled'

                if fields[6] and fields[6].strip() != '':
                    is_paid_at = datetime.datetime.strptime(fields[6], "%d.%m.%Y %H:%M")
                    is_paid = True

                reservation = Reservation.objects.get_or_create(resource=resource, begin=begin, end=end, event_description=fields[4], state=state, reserver_name=fields[7], reserver_email_address=fields[8], reserver_phone_number=fields[9], reserver_address_street=fields[10], reserver_address_zip=fields[11])[0]

                HMLReservation.objects.get_or_create(reservation=reservation, state_updated_at=state_updated_at, is_paid_at=is_paid_at, is_paid=is_paid)
            else:
                continue

        return Response(
            status=status.HTTP_201_CREATED
        )