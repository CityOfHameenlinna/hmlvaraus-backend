define(["jquery", "backbone", "models/BaseModel"],
    function($, Backbone, BaseModel) {
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
                if(this.get('street_address'))
                    return this.get('street_address').fi;
                else
                    return '';
            },

            getZip: function() {
                if(this.get('address_zip'))
                    return this.get('address_zip');
                else
                    return '';
            },

            getPhone: function() {
                if(this.get('phone'))
                    return this.get('phone');
                else
                    return '';
            },

            getEmail: function() {
                if(this.get('email'))
                    return this.get('email');
                else
                    return '';
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