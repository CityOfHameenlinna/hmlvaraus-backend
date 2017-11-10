define( [
    'App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'moment',
    'bootstrap-datepicker',
    'views/BaseView',
    'text!templates/boat_manage_new_reservation_view.tmpl'],
    function(App, Backbone, Radio, bootbox, Marionette, $, moment, datepicker, BaseView, template) {
        return BaseView.extend({
            initialize: function() {
                this.currentUser = window.App.userCollection.currentUser;
                this.boatReservationCollection = this.options.boatReservationCollection;
                this.boatResourceCollection = this.options.boatResourceCollection;
                this.unitCollection = this.options.unitCollection;
                this.mainRadioChannel = Radio.channel('main');
                var filterData = localStorage.getItem('boat_resource_filters');
                if(filterData) {
                    this.filters = JSON.parse(filterData);
                }

                this.listenTo(this.boatResourceCollection, 'change', this.render);
            },

            events: {
                'click #reservation-submit': 'save',
                'change input.required,textarea.required': 'checkRequired',
            },

            resourceFilter: function(e) {
                this.mainRadioChannel.trigger('resource-filter-changed');
            },

            render: function() {
                var me = this;

                var variables = {
                    filters: this.filters,
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
                    },
                    cmToMeters: function(cm) {
                        if(!cm)
                            return '';
                        var meters = Number(cm) / 100;
                        meters = meters.toFixed(2);
                        return meters;
                    },
                    isoToFinnishDate: function(isoDate) {
                        if(isoDate)
                            return moment(isoDate).format('D.M.YYYY HH:mm');
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

            validateAndReformatData: function(data) {
                if(!this.checkRequired() && !this.checkDateRequired())
                    return false;

                data.begin = moment(data.begin, 'D.M.YYYY HH:mm').toISOString();
                data.end = moment(data.end, 'D.M.YYYY HH:mm').toISOString();
                data.state = 'confirmed';
                data.user = {
                    id: data.user
                }
                data.reservable = false;
                var reserverSSN = data.reserver_ssn;
                delete data.reserver_ssn;

                var berth = undefined;
                var me = this;
                this.boatResourceCollection.forEach(function(resource) {
                    if (resource.get('resource').id == data.resource) {
                        berth = resource.attributes;
                    }
                });

                hmlreservationData = {
                    berth: berth,
                    reservation: data,
                    is_paid: false,
                    reserver_ssn: reserverSSN
                }

                return hmlreservationData;
            },

            save: function(e) {
                var me = this;
                e.preventDefault();
                var bodyJson = this.objectifyForm($('#new-reservation-form').serializeArray());

                bodyJson = this.validateAndReformatData(bodyJson);

                if(!bodyJson)
                    return;
                $.ajax({
                    url: '/api/hml_reservation/',
                    method: 'post',
                    data: JSON.stringify(bodyJson),
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done(function(data) {
                    me.mainRadioChannel.trigger('reservation-changed', data.id);
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                });
            }
        });
    });