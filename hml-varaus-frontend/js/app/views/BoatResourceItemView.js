define( ['App', 'backbone', 'backbone-radio', 'marionette', 'jquery', 'text!templates/boat_resource_item_view.tmpl'],
    function(App, Backbone, Radio, Marionette, $, template) {
        return Marionette.View.extend({
            className: "boat-resource-row",
            tagName: 'tr',
            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
                this.listenTo(this.model, 'change', this.render);
                this.boatReservationCollection = window.App.boatReservationCollection;
                this.unitCollection = window.App.unitCollection;
            },

            events: {
                'click #resource-new-reservation': 'newReservation',
                'click td.clickable': 'viewResource',
            },

            render: function() {
                var variables = {
                    model: this.model,
                    reservation_collection: this.boatReservationCollection,
                    unit: this.unitCollection.get(this.model.getUnitId()),
                    is_reserved: this.model.isReserved(this.boatReservationCollection) ? "Kyllä" : "Ei"
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                if(this.model.isDisabled())
                    this.$('td').closest('tr').addClass('danger');
            },

            newReservation: function() {
                this.mainRadioChannel.trigger('show-new-reservation', this.model.getResourceId())
            },

            viewResource: function() {
                window.App.router.navigate('boat-resource-details/' + this.model.getId(), {trigger: true});
            }
        });
    });