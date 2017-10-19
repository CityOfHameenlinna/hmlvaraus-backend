define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/boat_resource_item_view.tmpl'],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            className: "boat-resource-row",
            tagName: 'tr',
            initialize: function() {
                this.listenTo(this.model, 'change', this.render);
                this.boatReservationCollection = window.App.boatReservationCollection;
                this.unitCollection = window.App.unitCollection;
            },

            events: {
                'click td': 'viewResource'
            },

            render: function() {
                var variables = {
                    model: this.model,
                    reservation_collection: this.boatReservationCollection,
                    // unit: this.unitCollection.get(this.model.getUnitId()),
                    is_reserved: this.model.isReserved(this.boatReservationCollection) ? "Kyllä" : "Ei"
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                if(this.model.isDisabled())
                    this.$('td').closest('tr').addClass('danger');
            },

            viewResource: function() {
                window.App.router.navigate('boat-resource-details/' + this.model.getId(), {trigger: true});
            }
        });
    });