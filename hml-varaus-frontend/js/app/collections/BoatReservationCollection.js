define([
    "jquery",
    "backbone",
    'backbone-radio',
    "moment",
    "collections/BaseCollection",
    "models/BoatReservationModel"],
  function($, Backbone, Radio, moment, BaseCollection, BoatReservationModel) {
    var Collection = BaseCollection.extend({
        url: '/api/hml_reservation/',
        model: BoatReservationModel,
        filterKey: 'boat_reservation_filters',
        initialize: function() {
            var me = this;
            this.deferred = this.fetch({data: {show_cancelled: true}});
            this.mainRadioChannel = Radio.channel('main');
            this.mainRadioChannel.on('reservation-filter-changed', function() {
                me.fetchFiltered();
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