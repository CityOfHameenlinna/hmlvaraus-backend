define(["jquery", "backbone", 'moment'],
    function($, Backbone, moment) {
        var Model = Backbone.Model.extend({
        	getId: function() {
        		return this.get('id');
        	},
        	url: function() {
                var origUrl = Backbone.Model.prototype.url.call(this);
                return origUrl += origUrl.endsWith('/') ? '' : '/';
            }
        });

        return Model;

    }

);