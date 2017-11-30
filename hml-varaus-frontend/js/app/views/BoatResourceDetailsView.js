define( [
    'App',
    'backbone',
    'bootbox',
    'backbone-radio',
    'moment',
    'marionette',
    'jquery',
    'text!templates/boat_resource_details_view.tmpl'],
    function(App, Backbone, bootbox, Radio, moment, Marionette, $, template) {
        return Marionette.View.extend({
            reservationModel: false,
            initialize: function() {
                var me = this;
                this.mainRadioChannel = Radio.channel('main');
                this.currentUser = window.App.userCollection.currentUser;
                this.unitCollection = this.options.unitCollection;
                this.unitModel = this.unitCollection.get(this.model.getUnitId());
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
                'click #resource-new-reservation': 'newReservation',
                'click input.reservation-is-paid': 'changeIsPaid',
                'click input.reservation-key-returned': 'changeKeyReturned'
            },

            render: function() {
                var variables = {
                    currentUser: this.currentUser,
                    resource: this.model,
                    reservation: this.reservationModel,
                    unit: this.unitModel
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            },

            newReservation: function() {
                this.mainRadioChannel.trigger('show-new-reservation', this.model.getResourceId())
            },

            editResource: function() {
                window.App.router.navigate('boat-resource-edit/' + this.model.getId(), {trigger: true});
            },

            changeIsPaid: function(e) {
                e.stopPropagation();
                e.preventDefault();
                var me = this;
                var target = $(e.currentTarget);

                if(!target.prop('checked')) {
                    bootbox.confirm({
                        message: 'Olet merkkaamassa varauksen maksamattomaksi. Oletko varma?',
                        buttons: {
                            confirm: {
                                label: 'Merkkaa',
                                className: 'btn-danger'
                            },
                            cancel: {
                                label: 'Älä merkkaa',
                                className: 'btn-default'
                            }
                        },
                        callback: function (result) {
                            if(result) {
                                me.reservationModel.set('is_paid', true).saveIsPaid(false)
                                .done(function() {
                                    target.prop('checked', false);
                                })
                                .fail(function() {
                                    me.showRequestErrors();
                                    target.prop('checked', true);
                                });
                            }
                            else {
                                target.prop('checked', true);
                            }
                        }
                    });
                }
                else {
                    this.reservationModel.set('is_paid', true).saveIsPaid(true)
                    .done(function() {
                        target.prop('checked', true);
                    })
                    .fail(function() {
                        me.showRequestErrors();
                        target.prop('checked', false);
                    });
                }
            },

            changeKeyReturned: function(e) {
                e.stopPropagation();
                e.preventDefault();
                var me = this;
                var target = $(e.currentTarget);

                if(!target.prop('checked')) {
                    bootbox.confirm({
                        message: 'Olet merkkaamassa avaimen palauttamattomaksi. Oletko varma?',
                        buttons: {
                            confirm: {
                                label: 'Merkkaa',
                                className: 'btn-danger'
                            },
                            cancel: {
                                label: 'Älä merkkaa',
                                className: 'btn-default'
                            }
                        },
                        callback: function (result) {
                            if(result) {
                                me.reservationModel.set('key_returned', true).saveKeyReturned(false)
                                .done(function() {
                                    target.prop('checked', false);
                                })
                                .fail(function() {
                                    me.showRequestErrors();
                                    target.prop('checked', true);
                                });
                            }
                            else {
                                target.prop('checked', true);
                            }
                        }
                    });
                }
                else {
                    this.reservationModel.set('key_returned', true).saveKeyReturned(true)
                    .done(function() {
                        target.prop('checked', true);
                    })
                    .fail(function() {
                        me.showRequestErrors();
                        target.prop('checked', false);
                    });
                }
            }
        });
    });