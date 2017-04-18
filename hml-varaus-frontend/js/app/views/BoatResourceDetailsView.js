define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/boat_resource_details_view.tmpl'],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            render: function() {
                var variables = {
                    free_boat_resources: 5,
                    boat_reservation_queue: 6,
                    disabled_boat_resources: 9,
                    unpaid_reservations: 3
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            }
        });
    });