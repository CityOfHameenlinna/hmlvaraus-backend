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

class Berth(models.Model):
    DOCK = 'dock'
    GROUND = 'ground'
    NUMBER = 'number'

    TYPE_CHOICES = (
        (DOCK, _('dock')),
        (GROUND, _('ground')),
        (NUMBER, _('number')),
    )

    resource = models.OneToOneField(Resource, verbose_name=_('Resource'), db_index=True, on_delete=models.CASCADE)
    width_cm = models.PositiveSmallIntegerField(verbose_name=_('Berth width'), null=True, blank=True)
    depth_cm = models.PositiveSmallIntegerField(verbose_name=_('Berth depth'), null=True, blank=True)
    length_cm = models.PositiveSmallIntegerField(verbose_name=_('Berth length'), null=True, blank=True)
    type = models.CharField(choices=TYPE_CHOICES, verbose_name=_('Berth type'), default=DOCK, max_length=20)
    is_disabled = models.BooleanField(default=False)