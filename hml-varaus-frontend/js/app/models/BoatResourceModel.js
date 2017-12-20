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

            isReserved: function() {
                if (this.get('resource').reservable) {
                    return false
                }
                else {
                    return true
                }
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
            },

            isDisabled: function() {
                return this.get('is_disabled');
            },

            getDescription: function() {
                var desc = this.get('resource').description;
                if(desc && desc.fi)
                    return desc.fi;
                else
                    '';
            },

            getPrice: function() {
                return this.get('price');
            },

            getPriceFinnish: function() {
                var price = this.get('price');
                price = String(price).replace('.', ',')
                if(price) {
                    return price;
                }
                else {
                    return '0,00';
                }
            },

            formatTimeFinnish: function(time) {
                if(!time)
                    return '';
                time = moment(time);
                return time.format("D.M.YYYY HH:mm");
            },

            formatStateFinnish: function(state) {
                switch(state) {
                    case 'cancelled':
                        return "Peruutettu";
                        break;
                    case 'confirmed':
                        return "Hyväksytty";
                        break;
                    case 'denied':
                        return "Evätty";
                        break;
                    case 'requested':
                        return "Pyydetty";
                        break;
                }
            },

            formatIsPaidTimeFinnish: function(time) {
                if(!time)
                    return '';
                time = moment(time);
                return time.format("D.M.YYYY HH:mm");
            },

            formatKeyReturnedTimeFinnish: function(time) {
                if(!time)
                    return '';
                time = moment(time);
                return time.format("D.M.YYYY HH:mm");
            },

        });


        return Model;

    }

);
