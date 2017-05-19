define( ['App', 
    'backbone', 
    'backbone-radio',
    'bootbox',
    'marionette', 
    'jquery', 
    'moment', 
    'bootstrap-datepicker', 
    'views/BaseView',
    'text!templates/boat_new_reservation_view.tmpl'],
    function(App, Backbone, Radio, bootbox, Marionette, $, moment, datepicker, BaseView, template) {
        return BaseView.extend({

            initialize: function() {
                this.boatReservationCollection = this.options.boatReservationCollection;
                this.boatResourceCollection = this.options.boatResourceCollection;
                this.userCollection = this.options.userCollection;
                this.mainRadioChannel = Radio.channel('main');
            },

            events: {
                'click #reservation-submit': 'save',
                'change input.required,textarea.required': 'checkRequired',
            },

            render: function() {
                var me = this;

                var variables = {
                    boat_reservation_collection: this.boatReservationCollection,
                    boat_resource_collection: this.boatResourceCollection,
                    user_collection: this.userCollection
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                this.$('#reservation-begin-datepicker').datetimepicker({
                    locale: 'fi'
                }).on('dp.change', function(e) {
                    me.checkDateRequired(e);
                    me.checkBeginBeforeEnd();
                });

                this.$('#reservation-end-datepicker').datetimepicker({
                    locale: 'fi'
                }).on('dp.change', function(e) {
                    me.checkDateRequired(e);
                    me.checkBeginBeforeEnd();
                });
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

                data.user = {
                    id: data.user
                }

                var reserverSSN = data.reserver_ssn;

                delete data.reserver_ssn;

                hmlreservationData = {
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
                .done(function() {
                    me.mainRadioChannel.trigger('reservation-added');
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                });
            }
        });
    });