define(["jquery","backbone", "moment", "collections/BaseCollection", "models/BoatReservationModel"],
  function($, Backbone, moment, BaseCollection, BoatReservationModel) {
    var Collection = BaseCollection.extend({
        url: '/api/hml_reservation/',
        model: BoatReservationModel,
        
        initialize: function() {
            this.deferred = this.fetch();
        },

        filterByCurrent: function() {
            var filtered = this.filter(function(reservation) {
                return moment().isBetween(moment(reservation.getBeginTime()), moment(reservation.getEndTime()));
            });
            return new Collection(filtered);
        },

        filterByResource: function(resourceId) {
            var filtered = this.filter(function(reservation) {
                return reservation.getResourceId() == resourceId;
            });
            return new Collection(filtered);
        }
    });

    return Collection;
  });