define(["jquery", "backbone", 'moment'],
    function($, Backbone, moment) {
        var Model = Backbone.Model.extend({

            initialize: function() {

            },

            defaults: {

            },

            validate: function(attrs) {

            },

            getName: function() {
                return this.get('name').fi;
            },

            getId: function() {
                return this.get('id');
            },

            getMainImageUrl: function() {
                var url = '';
                this.get('images').forEach(function(image) {
                    if(image.type == 'main')
                        url = image.url;
                });
                return url;
            },

            isReserved: function(collection) {
                var me = this;
                var isReserved = false;
                collection.each(function(reservation) {
                    if(me.getId() == reservation.getResourceId() && moment().isBetween(moment(reservation.getBeginTime()), moment(reservation.getEndTime())))
                        isReserved = true;
                });

                return isReserved;
            }

        });

        return Model;

    }

);