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
            },

            cmToMeter: function(cm) {
                var meters = Number(cm) / 100;
                meters = meters.toFixed(2);
                meters = meters.toString().replace('.', ',');
                return meters;
            },

            getWidth: function() {
                return this.cmToMeter(this.get('width_cm'));
            },

            getLength: function() {
                return this.cmToMeter(this.get('length_cm'));
            },

            getDepth: function() {
                return this.cmToMeter(this.get('depth_cm'));
            },

            getUnit: function() {
                return this.get('unit');
            },

            getType: function() {
                var type = '';
                switch(this.get('type')) {
                    case 'dock':
                        type = 'Laituripaikka';
                        break;
                    case 'ground':
                        type = 'Polettipaikka';
                        break;
                    case 'number':
                        type = 'Numeropaikka';
                        break;
                }

                return type;
            }

        });

        return Model;

    }

);