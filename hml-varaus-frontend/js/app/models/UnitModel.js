define(["jquery", "backbone"],
    function($, Backbone) {
        var Model = Backbone.Model.extend({

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
            }

        });

        return Model;

    }

);