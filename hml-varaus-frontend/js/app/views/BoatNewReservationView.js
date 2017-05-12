define( ['App', 
    'backbone', 
    'backbone-radio',
    'marionette', 
    'jquery', 
    'moment', 
    'bootstrap-datepicker', 
    'text!templates/boat_new_reservation_view.tmpl'],
    function(App, Backbone, Radio, Marionette, $, moment, datepicker, template) {
        return Marionette.View.extend({

            initialize: function() {
                this.boatReservationCollection = this.options.boatReservationCollection;
                this.boatResourceCollection = this.options.boatResourceCollection;
                this.userCollection = this.options.userCollection;
                this.mainRadioChannel = Radio.channel('main');
            },

            events: {
                "click #reservation-submit": "save"
            },

            render: function() {
                var variables = {
                    boat_reservation_collection: this.boatReservationCollection,
                    boat_resource_collection: this.boatResourceCollection,
                    user_collection: this.userCollection
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                this.$('#reservation-begin-datepicker').datetimepicker({
                    locale: 'fi'
                });

                this.$('#reservation-end-datepicker').datetimepicker({
                    locale: 'fi'
                });
            },

            validateAndReformatData: function(data) {
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
                .fail(function() {
                    
                });
            },

            objectifyForm: function(formArray) {
                var returnArray = {};
                for (var i = 0; i < formArray.length; i++){
                    if(formArray[i]['value'] != '')
                        returnArray[formArray[i]['name']] = formArray[i]['value'];
                }
                return returnArray;
            }

        });
    });