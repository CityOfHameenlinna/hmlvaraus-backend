define(['backbone', 'marionette'], function(Backbone, Marionette) {
   return Backbone.Marionette.AppRouter.extend({
       appRoutes: {
            "": "showBoatManage",

            "boat-resources": "showBoatResourceList",
            "boat-resource-details/:id": "showBoatResourceDetails",
            "boat-resource-new": "showBoatResourceNew",
            "boat-resource-edit/:id": "showBoatResourceEdit",
            "boat-reservations": "showBoatReservationList",
            "boat-reservation-details/:id": "showBoatReservationDetails",
            "boat-manage-reservation-new": "showBoatManageReservationNew",
            "boat-reservation-new": "showBoatReservationNew",
            "boat-reservation-new/:id": "showBoatReservationNew",
            "boat-reservation-edit/:id": "showBoatReservationEdit",
            "units": "showUnitList",
            "unit-details/:id": "showUnitDetails",
            "unit-new": "showUnitNew",
            "unit-edit/:id": "showUnitEdit",
            "purchase/:id": "showPurchaseResult"
       }
   });
});