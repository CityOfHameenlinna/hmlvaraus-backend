define( [
    'App',
    'backbone',
    'bootbox',
    'marionette',
    'jquery',
    'views/BaseView',
    'text!templates/boat_reservation_details_view.tmpl'],
    function(App, Backbone, bootbox, Marionette, $, BaseView, template) {
        return BaseView.extend({
            initialize: function() {
                this.resourceCollection = this.options.resourceCollection;
                this.unitCollection = this.options.unitCollection;
                this.resourceModel = this.resourceCollection.getByResourceId(this.model.getResourceId());
                this.unitModel = this.unitCollection.get(this.resourceModel.getUnitId());
            },

            events: {
                'click input.reservation-is-paid': 'changeIsPaid',
                'click #reservation-cancel': 'cancelReservation',
                'click input.reservation-key-returned': 'changeKeyReturned'
            },

            render: function() {
                var variables = {
                    reservation: this.model,
                    resource: this.resourceModel,
                    unit: this.unitModel
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

            },

            cancelReservation: function() {
                var me = this;
                bootbox.confirm({
                    message: 'Olet peruuttamassa henkilön ' + this.model.getReserverName() + ' venepaikkavarauksen. Oletko varma?',
                    buttons: {
                        confirm: {
                            label: 'Peruuta',
                            className: 'btn-danger'
                        },
                        cancel: {
                            label: 'Älä peruuta',
                            className: 'btn-default'
                        }
                    },
                    callback: function (result) {
                        if(result) {
                            me.model.saveCancel()
                            .done(function() {
                                me.render();
                            })
                            .fail(function(result) {
                                me.showRequestErrors(result.responseJSON);
                            });
                        }
                    }
                });
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
                                me.model.set('is_paid', true).saveIsPaid(false)
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
                    this.model.set('is_paid', true).saveIsPaid(true)
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
                                me.model.set('key_returned', true).saveKeyReturned(false)
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
                    this.model.set('key_returned', true).saveKeyReturned(true)
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