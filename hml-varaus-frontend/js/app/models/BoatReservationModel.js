define(["jquery", "backbone", "moment", "models/BaseModel"],
    function($, Backbone, moment, BaseModel) {
        // Creates a new Backbone Model class object
        var Model = BaseModel.extend({

            initialize: function() {

            },

            defaults: {

            },

            validate: function(attrs) {

            },

            getStateFinnish: function() {
                switch(this.get('reservation').state) {
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

            getState: function() {
                return this.get('reservation').state;
            },

            getResourceId: function() {
                return this.get('reservation').resource;
            },

            getBeginTime: function() {
                return this.get('reservation').begin;
            },

            getEndTime: function() {
                return this.get('reservation').end;
            },

            getBeginTimeFinnish: function() {
                var time = moment(this.get('reservation').begin);
                return time.format("D.M.YYYY HH:mm");
            },

            getEndTimeFinnish: function() {
                var time = moment(this.get('reservation').end);
                return time.format("D.M.YYYY HH:mm");
            },

            getTimeSpanFinnish: function() {
                return this.getBeginTimeFinnish() + " - " + this.getEndTimeFinnish();
            },

            getReserver: function(userCollection) {
                if(!this.get('reservation').user || !this.get('reservation').user.id)
                    return "Ei tietoja";

                var userModel = userCollection.getByUID(this.get('reservation').user.id);

                if(!userModel)
                    return 'Ei tietoja';

                return userModel.get('first_name') + ' ' + userModel.get('last_name') + ' (' + userModel.get('username') + ')';
            },

            getIsPaid: function() {
                return this.get('is_paid');
            },

            getIsPaidFinnish: function() {
                return this.get('is_paid') ? "Kyllä" : "Ei";
            },

            getReserverName: function() {
                return this.get('reservation').reserver_name;
            },

            getReserverAddress: function() {
                return this.get('reservation').reserver_address_street;
            },

            getReserverZip: function() {
                return this.get('reservation').reserver_address_zip;
            },

            getReserverCity: function() {
                return this.get('reservation').reserver_address_city;
            },

            getReserverEmail: function() {
                return this.get('reservation').reserver_email_address;
            },

            getReserverPhone: function() {
                return this.get('reservation').reserver_phone_number;
            },

            getRespaReservationId: function() {
                return this.get('reservation').id;
            },

            getStateUpdated: function() {
                var time = moment(this.get('state_updated_by'));
                return time.format("D.M.YYYY HH:mm");
            },

            isCancelled: function() {
                return this.getState() == 'cancelled';
            },

            saveIsPaid: function(value) {
                return $.ajax({
                    url: this.url(),
                    method: 'patch',
                    data: JSON.stringify({is_paid: value}),
                    dataType: 'json',
                    contentType: 'application/json'
                });
            },

            saveCancel: function() {
                var reservation = this.get('reservation');
                reservation.state = 'cancelled';
                this.set('reservation', reservation);
                return $.ajax({
                    url: this.url(),
                    method: 'patch',
                    data: JSON.stringify({state: 'cancelled'}),
                    dataType: 'json',
                    contentType: 'application/json'
                });
            }
        });
        return Model;

    }

);