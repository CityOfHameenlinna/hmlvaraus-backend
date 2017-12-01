from respa.urls import *
from hmlvaraus import admin
from hmlvaraus.api.hml_reservation import PurchaseView, RenewalView

urlpatterns += [
    url(r'^sysadmin/', include(admin.site.urls)),
    url(r'^$', IndexView.as_view()),
    url(r'^api/purchase/', PurchaseView.as_view()),
    url(r'^api/purchase/success/(?P<purchasecode>[0-9a-f]{40})/$', PurchaseView.as_view()),
    url(r'^api/purchase/failure/', PurchaseView.as_view()),
    url(r'^api/purchase/notification/', PurchaseView.as_view()),
    url(r'^api/renewal/', RenewalView.as_view()),
]