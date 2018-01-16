define( ['App', 'backbone', 'marionette', 'jquery', 'bootbox', 'views/BaseView', 'text!templates/boat_reservation_item_view.tmpl'],
    function(App, Backbone, Marionette, $, bootbox, BaseView, template) {
        return BaseView.extend({
            className: 'boat-reservation-row',
            tagName: 'tr',

        	initialize: function() {
                this.currentUser = window.App.userCollection.currentUser;
                this.boatResourceCollection = window.App.boatResourceCollection;
                this.unitCollection = window.App.unitCollection;
                this.userCollection = window.App.userCollection;
                this.listenTo(this.model, 'change', this.render);
        	},

            events: {
                'click td': 'viewReservation',
                'click input.reservation-is-paid': 'changeIsPaid',
                'click input.reservation-key-returned': 'changeKeyReturned'
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
                                    target.prop('checked', true);
                                    me.showRequestErrors();
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
                        target.prop('checked', false);
                        me.showRequestErrors();
                    });
                }
            },

            changeKeyReturned: function(e) {
                e.stopPropagation();
                e.preventDefault();
                var me = this;
                var target = $(e.currentTarget);

                console.log('foo');
                
                if(!target.prop('checked')) {
                    bootbox.confirm({
                        message: 'Olet merkkaamassa avaimen palautetuksi. Oletko varma?',
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
                                me.model.set('is_paid', true).saveKeyReturned(false)
                                .done(function() {
                                    target.prop('checked', false);
                                })
                                .fail(function() {
                                    target.prop('checked', true);
                                    me.showRequestErrors();
                                });
                            }
                            else {
                                target.prop('checked', true);
                            }
                        }
                    });
                }
                else {
                    this.model.set('is_paid', true).saveKeyReturned(true)
                    .done(function() {
                        target.prop('checked', true);
                    })
                    .fail(function() {
                        target.prop('checked', false);
                        me.showRequestErrors();
                    });
                }
            },

            viewReservation: function(e) {
                if($(e.target).hasClass('reservation-is-paid'))
                    return;
                else if($(e.target).hasClass('reservation-key-returned'))
                    return;
                window.App.router.navigate('boat-reservation-details/' + this.model.getId(), {trigger: true});
            },

            render: function() {
                var resourceModel = this.boatResourceCollection.getByResourceId(this.model.get('berth').resource.id);
                var unitModel = this.unitCollection.get(resourceModel.getUnitId());
                var variables = {
                    currentUser: this.currentUser,
                    model: this.model,
                    resource_model: resourceModel,
                    unit_model: unitModel,
                    user_collection: this.userCollection
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                if (!this.model.getKeyReturned() && this.model.getHasEnded()
                || !this.model.getKeyReturned() && this.model.isCancelled()) {
                    this.$('td').closest('tr').addClass('danger');
                }
            }
        });
    });
