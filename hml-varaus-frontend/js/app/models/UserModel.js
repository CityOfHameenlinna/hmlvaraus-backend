define(["jquery", "backbone", "models/BaseModel"],
    function($, Backbone, BaseModel) {
        var Model = Backbone.Model.extend({

            initialize: function() {

            },

            defaults: {

            },

            validate: function(attrs) {

            },

            isStaff: function() {
                return this.get('is_staff');
            },

            getId: function() {
                return this.get('uuid');
            },

            getFullName: function() {
                if(!this.get('first_name') && !this.get('last_name'))
                    return "Nimeä ei määritelty";

                return this.get('first_name') + ' ' + this.get('last_name');
            },

            getUserName: function() {
                return this.get('username');
            }

        });

        return Model;

    }

);