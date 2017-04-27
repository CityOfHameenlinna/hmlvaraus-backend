define(['backbone', 'marionette'], function(Backbone, Marionette) {
   return Backbone.Marionette.AppRouter.extend({
       appRoutes: {
            "": "showBoatManage",

            "boat-resources": "showBoatResourceList",
            "boat-resource-details/:id": "showBoatResourceDetails",
            "boat-resource-new": "showBoatResourceNew",

            "boat-reservations": "showBoatReservationList",
            "boat-reservation-details/:id": "showBoatReservationDetails",
            "boat-reservation-new": "showBoatReservationNew"
       }
   });
});