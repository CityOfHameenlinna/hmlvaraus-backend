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
        },

        parse: function(response) {
            var obj = response.results;
            if (response.results) {
                obj = response.results;
            }
            else {
                obj = [response];
            }
            var reservation = _.map(obj, function (value, key) {
                return obj[key];
            });
            var resourceCollection = window.App.boatResourceCollection;
            var unitCollection = window.App.unitCollection;
            var resource = _.map(obj, function (value, key) {
                return obj[key].berth;
            });
            var unit = _.map(obj, function (value, key) {
                return obj[key].berth.resource.unit;
            });
            resourceCollection.push(resource);
            unitCollection.push(unit);
            return reservation
        }
    });

    return Collection;
  });
