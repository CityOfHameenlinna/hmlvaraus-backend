define(["jquery", "backbone", 'moment', "models/BaseModel"],
    function($, Backbone, moment, BaseModel) {
        var Model = BaseModel.extend({

            initialize: function() {

            },

            defaults: {

            },

            validate: function(attrs) {

            },

            getName: function() {
                return this.get('resource').name.fi;
            },

            getId: function() {
                return this.get('id');
            },

            getResourceId: function() {
                return this.get('resource').id
            },

            getMainImageUrl: function() {
                var url = '';
                this.get('resource').images.forEach(function(image) {
                    if(image.type == 'main')
                        url = image.url;
                });
                return url;
            },

            isReserved: function(collection) {
                var me = this;
                var isReserved = false;
                collection.each(function(reservation) {
                    if(me.getResourceId() == reservation.getResourceId() && moment().isBetween(moment(reservation.getBeginTime()), moment(reservation.getEndTime())))
                        isReserved = true;
                });

                return isReserved;
            },

            cmToMeter: function(cm, separator) {
                if(!separator)
                    separator = ',';
                var meters = Number(cm) / 100;
                meters = meters.toFixed(2);
                meters = meters.toString().replace('.', separator);
                return meters;
            },

            getWidth: function(separator) {
                return this.cmToMeter(this.get('width_cm'), separator);
            },

            getLength: function(separator) {
                return this.cmToMeter(this.get('length_cm'), separator);
            },

            getDepth: function(separator) {
                return this.cmToMeter(this.get('depth_cm'), separator);
            },

            getUnit: function() {
                return this.get('resource').unit;
            },

            getUnitId: function() {
                return this.get('resource').unit_id;
            },

            getType: function() {
                return this.get('type');
            },

            getTypeFinnish: function() {
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