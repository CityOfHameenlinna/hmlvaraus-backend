define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/boat_resource_details_view.tmpl'],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
            },
            events: {
                'click #resource-edit': 'editResource'
            },
            render: function() {
                var variables = {
                    resource: this.model,
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

            },

            editResource: function() {
                window.App.router.navigate('boat-resource-edit/' + this.model.getId(), {trigger: true});
            }
        });
    });