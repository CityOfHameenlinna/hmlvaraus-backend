define( ['App', 'backbone', 'backbone-radio', 'moment', 'marionette', 'jquery', 'text!templates/boat_resource_details_view.tmpl'],
    function(App, Backbone, Radio, moment, Marionette, $, template) {
        return Marionette.View.extend({
            reservationModel: false,
            initialize: function() {
                var me = this;

                this.mainRadioChannel = Radio.channel('main');

                this.options.boatReservationCollection.each(function(reservation) {
                    if(reservation.getResourceId() == me.model.getResourceId()) {
                        if(!me.reservationModel || moment(me.reservationModel.getEndTime()).isBefore(moment(reservation.getEndTime()))) {
                            me.reservationModel = reservation;
                        }
                    }
                });
            },
            events: {
                'click #resource-edit': 'editResource',
                'click #resource-new-reservation': 'newReservation'
            },

            render: function() {
                var variables = {
                    resource: this.model,
                    reservation: this.reservationModel
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            },

            newReservation: function() {
                this.mainRadioChannel.trigger('show-new-reservation', this.model.getResourceId())
            },

            editResource: function() {
                window.App.router.navigate('boat-resource-edit/' + this.model.getId(), {trigger: true});
            }
        });
    });