define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/unit_details_view.tmpl'],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
            },
            events: {
                'click #unit-edit': 'editUnit'
            },
            render: function() {
                var variables = {
                    unit: this.model,

                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                this.addGoogleMap();
            },
            addGoogleMap: function() {

            },
            editUnit: function() {
                window.App.router.navigate('unit-edit/' + this.model.getId(), {trigger: true});
            }
        });
    });