define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/boat_reservation_details_view.tmpl'],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.resourceCollection = this.options.resourceCollection
            },

            events: {
                'click input.reservation-is-paid': 'changeIsPaid'
            },

            render: function() {
                var variables = {
                    reservation: this.model,
                    resource: this.resourceCollection.getByResourceId(this.model.getResourceId())
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

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
        });
    });