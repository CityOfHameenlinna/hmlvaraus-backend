define( ['App', 'backbone', 'marionette', 'jquery', 'views/BaseView', 'text!templates/boat_reservation_item_view.tmpl'],
    function(App, Backbone, Marionette, $, BaseView, template) {
        return BaseView.extend({
            className: "boat-reservation-row",
            tagName: 'tr',

        	initialize: function() {
                this.boatResourceCollection = window.App.boatResourceCollection;
                this.unitCollection = window.App.unitCollection;
                this.userCollection = window.App.userCollection;
                this.listenTo(this.model, 'change', this.render);
        	},

            events: {
                'click td': 'viewReservation',
                'click input.reservation-is-paid': 'changeIsPaid'
            },

            changeIsPaid: function(e) {
                e.stopPropagation();
                var me = this;
                var target = $(e.currentTarget);

                if(!target.prop('checked')) {
                    this.model.set('is_paid', true).saveIsPaid(false)
                    .done(function() {
                        target.removeProp('checked')
                    })
                    .fail(function() {
                        me.showRequestErrors();
                    });
                }
                else {
                    this.model.set('is_paid', true).saveIsPaid(true)
                    .done(function() {
                        target.prop('checked', true);
                    })
                    .fail(function() {
                        me.showRequestErrors();
                    });
                }
            },

            viewReservation: function(e) {
                if($(e.target).hasClass('reservation-is-paid'))
                    return;
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