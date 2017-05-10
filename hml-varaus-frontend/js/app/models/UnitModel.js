define(["jquery", "backbone"],
    function($, Backbone) {
        var Model = Backbone.Model.extend({

            url: function() {
                var origUrl = Backbone.Model.prototype.url.call(this);
                return origUrl += origUrl.endsWith('/') ? '' : '/';
            },

            initialize: function() {

            },

            defaults: {

            },

            validate: function(attrs) {

            },

            getId: function() {
                return this.get('id');
            },

            getName: function() {
                return this.get('name').fi;
            },

            getStreetAddress: function() {
                return this.get('street_address').fi;
            },

            getZip: function() {
                return this.get('address_zip');
            },

            getPhone: function() {
                return this.get('phone');
            },

            getEmail: function() {
                return this.get('email');
            }
        });

        return Model;

    }

);