import datetime
import os
import re
from decimal import Decimal

import arrow
import django.db.models as dbm
from django.apps import apps
from django.conf import settings
from django.contrib.gis.db import models
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.six import BytesIO
from django.utils.translation import ugettext_lazy as _
from django.utils.translation import pgettext_lazy
from django.contrib.postgres.fields import HStoreField
from image_cropping import ImageRatioField
from PIL import Image
from autoslug import AutoSlugField

from resources.errors import InvalidImage

from resources.models import Reservation, Resource, Unit, ResourceType

class HMLReservation(models.Model):
	reservation = models.OneToOneField(Reservation, verbose_name=_('Reservation'), db_index=True, on_delete=models.CASCADE)
	is_paid = models.BooleanField(verbose_name=_('Is paid'), default=False)
	reserver_ssn = models.CharField(verbose_name=_('Reserver ssn'), default='', max_length=11)
	state_updated_at = models.DateTimeField(verbose_name=_('Time of modification'), default=timezone.now)

