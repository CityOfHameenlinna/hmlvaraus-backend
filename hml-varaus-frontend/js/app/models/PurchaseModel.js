define(["jquery", "backbone", "models/BaseModel", 'moment'],
    function($, Backbone, BaseModel, moment) {
        var Model = BaseModel.extend({
            urlRoot: '/api/purchase/',
            initialize: function() {

            },

            defaults: {

            },

            validate: function(attrs) {

            },

            getProductName: function() {
                return this.get('product_name');
            },

            getReservationStart: function() {
                var beginIsoString = this.get('hml_reservation').reservation.begin;
                return moment(beginIsoString).format('D.M.YYYY HH:mm');
            },

            getReservationEnd: function() {
                var endIsoString = this.get('hml_reservation').reservation.end;
                return moment(endIsoString).format('D.M.YYYY HH:mm');
            },

            getReserverName: function() {
                return this.get('reserver_name');
            },

            getReserverStreetAddress: function() {
                return this.get('reserver_address_street');
            },

            getReserverCity: function() {
                return this.get('reserver_address_city');
            },

            getReserverZip: function() {
                return this.get('reserver_address_zip');
            },

            getReserverEmail: function() {
                return this.get('reserver_email_address');
            },

            getReserverPhone: function() {
                return this.get('reserver_phone_number');
            },

            isSuccess: function() {
                if(this.get('purchase_process_success'))
                    return true;
                else if(this.get('purchase_process_failure'))
                    return false;
            }
        });

        return Model;

    }

);