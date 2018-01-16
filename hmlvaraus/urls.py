from hmlvaraus import admin
from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter
from hmlvaraus.api.hml_reservation import PurchaseView, RenewalView, HMLReservationViewSet
from hmlvaraus.api.berth import BerthViewSet, GroundBerthPriceView
from hmlvaraus.api.unit import UnitViewSet
from hmlvaraus.api.user import UserViewSet
from hmlvaraus.views.spa import IndexView
from hmlvaraus.api.importer import ImporterView

router = DefaultRouter()
router.register(r'hml_reservation', HMLReservationViewSet)
router.register(r'berth', BerthViewSet)
router.register(r'unit', UnitViewSet)
router.register(r'user', UserViewSet)

urlpatterns = [
    url(r'^accounts/', include('allauth.urls')),
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^sysadmin/', include(admin.site.urls)),
    url(r'^$', IndexView.as_view()),
    url(r'^api/purchase/', PurchaseView.as_view()),
    url(r'^api/renewal/', RenewalView.as_view()),
    url(r'^api/ground_berth_price/', GroundBerthPriceView.as_view()),
    url(r'^importer/', ImporterView.as_view()),
    url(r'^api/', include(router.urls))
]
