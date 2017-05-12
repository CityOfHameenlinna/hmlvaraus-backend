define(["jquery", "backbone", 'moment'],
    function($, Backbone, moment) {
        var Model = Backbone.Model.extend({
        	getId: function() {
        		return this.get('id');
        	}
        });

        return Model;

    }

);