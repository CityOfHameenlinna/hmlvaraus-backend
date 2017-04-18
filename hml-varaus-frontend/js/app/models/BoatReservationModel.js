define(["jquery", "backbone", "moment"],
    function($, Backbone, moment) {
        // Creates a new Backbone Model class object
        var Model = Backbone.Model.extend({

            initialize: function() {

            },

            defaults: {

            },

            validate: function(attrs) {

            },

            getStateFinnish: function() {
                switch(this.get('state')) {
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
                return this.get('state');
            },

            getResourceId: function() {
                return this.get('resource');
            },

            getBeginTime: function() {
                return this.get('begin');
            },

            getEndTime: function() {
                return this.get('end');
            },

            getBeginTimeFinnish: function() {
                var time = moment(this.get('begin'));
                return time.format("D.M.YYYY HH:mm");
            },

            getEndTimeFinnish: function() {
                var time = moment(this.get('end'));
                return time.format("D.M.YYYY HH:mm");
            },

            getTimeSpanFinnish: function() {
                return this.getBeginTimeFinnish() + " - " + this.getEndTimeFinnish();
            },

            getReserver: function(userCollection) {
                if(!this.get('user') || !this.get('user').id)
                    return "Ei tietoja";

                var userModel = userCollection.getByUID(this.get('user').id);

                if(!userModel)
                    return 'Ei tietoja';

                return userModel.get('first_name') + ' ' + userModel.get('last_name') + ' (' + userModel.get('username') + ')';
            }
        });
        return Model;

    }

);