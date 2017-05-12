define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/boat_reservation_details_view.tmpl'],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.resourceCollection = this.options.resourceCollection
            },

            events: {
            },

            render: function() {
                var variables = {
                    reservation: this.model,
                    resource: this.resourceCollection.getByResourceId(this.model.getResourceId())
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

            },
        });
    });