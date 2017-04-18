define(["jquery","backbone", "moment", "models/BoatReservationModel"],
  function($, Backbone, moment, BoatReservationModel) {
    var Collection = Backbone.Collection.extend({
        url: '/api/reservation/',
        model: BoatReservationModel,
        
        initialize: function() {
            this.deferred = this.fetch();
        },

        parse: function(response) {
            var obj = response.results;

            return _.map(obj, function (value, key) {
              return obj[key];
            });
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