define(["jquery", "backbone", 'moment'],
    function($, Backbone, moment) {
        var Model = Backbone.Model.extend({
            getId: function() {
                return this.get('id');
            },

            url: function() {
                var origUrl = Backbone.Model.prototype.url.call(this);
                return origUrl += origUrl.endsWith('/') ? '' : '/';
            },

            urli: function() {
                var origUrl = Backbone.Model.prototype.url.call(this);
                return origUrl += origUrl.endsWith('/') ? '' : '/';
            },

            patch: function(data) {
                return $.ajax({
                    url: this.urli(),
                    method: 'patch',
                    data: JSON.stringify(data),
                    dataType: 'json',
                    contentType: 'application/json'
                });            
            }
        });

        return Model;

    }

);