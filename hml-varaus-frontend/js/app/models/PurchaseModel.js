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

            getStartDateFinnish: function() {
                var beginIsoString = this.get('purchase_process_started');
                return moment(beginIsoString).format('D.M.YYYY HH:mm');
            },

            getSuccessDateFinnish: function() {
                var isoString = this.get('purchase_process_success');
                if(!isoString)
                    return false;
                return moment(isoString).format('D.M.YYYY HH:mm');
            },

            getFailureDateFinnish: function() {
                var isoString = this.get('purchase_process_failure');
                if(!isoString)
                    return false;
                return moment(isoString).format('D.M.YYYY HH:mm');
            },

            getStateWithDateFinnish: function() {
                if(this.getSuccessDateFinnish()) {
                    return 'Onnistunut (' + this.getSuccessDateFinnish() + ')';
                }
                else if(this.getFailureDateFinnish()) {
                    return 'Epäonnistunut (' + this.getFailureDateFinnish() + ')';
                }
                else {
                    return 'Maksuprosessi kesken';
                }
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

            getPrice: function() {
                return this.get('price_vat');
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
