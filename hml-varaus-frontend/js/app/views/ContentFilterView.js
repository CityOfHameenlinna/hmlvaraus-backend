define( [
    'App', 
    'backbone', 
    'marionette', 
    'jquery', 
    'text!templates/content_filter_view.tmpl'
    ],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            tagName: 'div',
            className: 'filter-container',
            template: template,

            regions: {
            },

            initialize: function() {
            },


            render: function() {
                var variables = {}

                var tmpl = _.template(template)

                this.$el.html(tmpl(variables));
            }
        }
    );
    });