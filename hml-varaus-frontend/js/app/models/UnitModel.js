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
            },

            getLocation: function() {
                if(this.get('location')) {
                    return {
                        lng: Number(this.get('location').coordinates[0]),
                        lat: Number(this.get('location').coordinates[1])
                    };
                }
                else {
                    return false;
                }
            },
            
            getDescription: function() {
                var description = this.get('description');
                if(description) {
                    return description.fi;
                }
                else {
                    return '';
                }
            }
        });

        return Model;

    }

);