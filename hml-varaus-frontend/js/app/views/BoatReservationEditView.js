define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'moment',
    'views/BaseView',
    'text!templates/boat_reservation_edit_view.tmpl'],
    function(App, Backbone, Radio, bootbox, Marionette, $, moment, BaseView, template) {
        return BaseView.extend({
            initialize: function() {
                this.boatResourceCollection = this.options.boatResourceCollection;
                this.unitCollection = this.options.unitCollection
                this.mainRadioChannel = Radio.channel('main');
            },

            events: {
                'click #reservation-submit': 'saveReservation',
                'click #reservation-cancel': 'viewResource',
                'change .required': 'checkRequired',
                'change .validated-data': 'validateData'
            },

            render: function() {
                var me = this;
                var filteredCollection = this.boatResourceCollection.filter(function(resource) {
                    if(!resource.isDisabled())
                        return true;
                });
                var variables = {
                    boat_resource_collection: filteredCollection,
                    reservation: this.model,
                    unit_collection: this.unitCollection,
                    resource_id: this.options.resourceId
                }

                var helpers = {
                    getUnitName: function(unit_id) {
                        var unit = this.unit_collection.get(unit_id);
                        if(unit)
                            return unit.getName();
                        else
                            return '';
                    }
                }

                _.extend(variables, helpers);

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                this.$('#reservation-begin-datepicker').datetimepicker({
                    locale: 'fi'
                }).on('dp.change', function(e) {
                    me.checkDateRequired(e);
                    me.checkBeginBeforeEnd();
                    me.setEndDate(e);
                });

                this.$('#reservation-end-datepicker').datetimepicker({
                    locale: 'fi'
                }).on('dp.change', function(e) {
                    me.checkDateRequired(e);
                    me.checkBeginBeforeEnd();
                });
            },

            setEndDate: function(e) {
                var newDate = e.date.add(1, 'y').format('D.M.YYYY HH:mm');
                $('#reservation-end-datepicker').find('input').val(newDate);
            },

            checkBeginBeforeEnd: function(e) {
                var beginPicker = $('#reservation-begin-datepicker');
                var endPicker = $('#reservation-end-datepicker');

                var beginString = beginPicker.find('input').val();
                var endString = endPicker.find('input').val();

                var beginTime = moment(beginString, 'D.M.YYYY HH:mm');
                var endTime = moment(endString, 'D.M.YYYY HH:mm');
                if(!beginTime || !endTime)
                    return false;

                if(endTime.isBefore(beginTime)) {
                    beginPicker.find('input').addClass('validation-error');
                    endPicker.find('input').addClass('validation-error');
                    beginPicker.next('span.error').find('p').text('Alkupäivämäärän pitää olla ennen loppupäivämäärää.');
                }
                else {
                    beginPicker.find('input').removeClass('validation-error');
                    endPicker.find('input').removeClass('validation-error');
                    beginPicker.next('span.error').find('p').text('');
                }
            },

            viewResource: function(e) {
                e.preventDefault();
                window.App.router.navigate('boat-reservation-details/' + this.model.getId(), {trigger: true});
            },

            saveReservation: function(e) {
                var me = this;
                e.preventDefault();
                var data = this.objectifyForm($('#edit-reservation-form').serializeArray());
                data = this.validateAndReformatData(data);

                if(!data)
                    return;

                this.model.set('begin', data.begin);
                this.model.set('end', data.end);
                this.model.set('state', data.state);
                this.model.set('user', data.user);
                this.model.set('reservable', data.reservable);
                this.model.set('reserver_ssn', data.reserverSSN);

                var reservation = this.model.get('reservation');

                reservation.event_description = data.event_description;
                reservation.reserver_name = data.reserver_name;
                reservation.reserver_email_address = data.reserver_email_address;
                reservation.reserver_phone_number = data.reserver_phone_number;
                reservation.reserver_address_street = data.reserver_address_street;
                reservation.reserver_address_zip = data.reserver_address_zip;

                this.model.set('reservation', reservation);

                this.model.save()
                .done(function(data) {
                    me.mainRadioChannel.trigger('reservation-changed', data.id);
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                });
            },

            validateAndReformatData: function(data) {
                if (!this.checkRequired()) {
                    return false;
                }

                data.reservation = {
                    reserver_name: data.reserver_name,
                    reserver_email_address: data.reserver_email_address,
                    reserver_phone_number: data.reserver_phone_number,
                    reserver_address_street: data.reserver_address_street,
                    reserver_address_zip: data.reserver_address_zip,
                    event_description: data.event_description,
                    event_description_fi: data.event_description,
                }

                data.begin = moment(data.begin, 'D.M.YYYY HH:mm').toISOString();
                data.end = moment(data.end, 'D.M.YYYY HH:mm').toISOString();
                data.state = 'confirmed';
                data.user = {
                    id: data.user
                }
                data.reservable = false;

                return data;
            }
        });
    });
