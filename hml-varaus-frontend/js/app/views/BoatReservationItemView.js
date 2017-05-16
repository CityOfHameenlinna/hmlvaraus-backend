define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/boat_reservation_item_view.tmpl'],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            className: "boat-reservation-row",
            tagName: 'tr',

        	initialize: function() {
                this.boatResourceCollection = window.App.boatResourceCollection;
                this.unitCollection = window.App.unitCollection;
                this.userCollection = window.App.userCollection;
                this.listenTo(this.model, 'change', this.render);
        	},

            events: {
                'click td': 'viewReservation'
            },

            viewReservation: function() {
                window.App.router.navigate('boat-reservation-details/' + this.model.getId(), {trigger: true});
            },

            render: function() {
                var resourceModel = this.boatResourceCollection.getByResourceId(this.model.getResourceId());
                var unitModel = this.unitCollection.get(resourceModel.getUnitId());
            	var variables = {
            		model: this.model,
                    resource_model: resourceModel,
                    unit_model: unitModel,
                    user_collection: this.userCollection
            	}
            	var tmpl = _.template(template);
            	this.$el.html(tmpl(variables));
            }
        });
    });