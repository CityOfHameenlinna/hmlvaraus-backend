define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'views/BaseView',
    'text!templates/boat_new_resource_ground_view.tmpl'],
    function(App, Backbone, Radio, bootbox, Marionette, $, BaseView, template) {
        return BaseView.extend({
            initialize: function() {
                this.userCollection = window.App.userCollection;
                this.currentUser = this.userCollection.currentUser;
                this.unitCollection = this.options.unitCollection;
                this.mainRadioChannel = Radio.channel('main');
            },

            render: function() {
                var variables = {
                    unit_collection: this.unitCollection,
                    currentUser: this.currentUser,
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            },

            events: {
                'click #resource-submit': 'save',
                'change .required': 'checkRequired',
                'change .validated-data': 'validateData'
            },

            validateAndReformatData: function(data) {
                if(!this.checkRequired() || !this.validateData())
                    return false;

                var berth = {}
                berth.resource = {
                    name: data.name,
                    name_fi: data.name,
                    description: data.description,
                    description_fi: data.description,
                    unit_id: data.unit,
                    reservable: true
                }
                delete data.name;
                delete data.unit;
                berth.length_cm = data.length_cm ? Number(data.length_cm) * 100 : 0;
                berth.width_cm = data.width_cm ? Number(data.width_cm) * 100 : 0;
                berth.depth_cm = data.depth_cm ? Number(data.depth_cm) * 100 : 0;
                berth.price = Number(data.price);
                berth.type = data.type;
                delete data.type;
                delete data.length_cm;
                delete data.width_cm;
                delete data.depth_cm;
                delete data.price;

                data = {
                    'reservation': data,
                    'berth': berth
                }

                return data;
            },

            validateData: function(e) {
                var isValid = true;

                if(e) {
                    target = $(e.currentTarget);
                    if(target.hasClass('berth-size')) {
                        if(target.val() < 0 ||target.val() > 10) {
                            target.addClass('validation-error');
                            target.next('span.error').find('p').text('Valitse arvo väliltä 0-10');
                            isValid = false;
                        }
                        else {
                            target.removeClass('validation-error');
                            target.next('span.error').find('p').text('');
                        }
                    }
                }
                else {
                    var length = $('#resource-berth-length');
                    var width = $('#resource-berth-width');
                    var depth = $('#resource-berth-depth');

                    if(length.val() < 0 || length.val() > 10) {
                        length.addClass('validation-error');
                        width.next('span.error').find('p').text('Valitse arvo väliltä 0-10');
                        isValid = false;
                    }

                    if(width.val() < 0 || width.val() > 10) {
                        width.addClass('validation-error');
                        width.next('span.error').find('p').text('Valitse arvo väliltä 0-10');
                        isValid = false;
                    }

                    if(depth.val() < 0 ||depth.val() > 10) {
                        depth.addClass('validation-error');
                        width.next('span.error').find('p').text('Valitse arvo väliltä 0-10');
                        isValid = false;
                    }
                }

                return isValid;
            },
            save: function(e) {
                var me = this;
                e.preventDefault();
                var bodyJson = this.objectifyForm($('#new-resource-ground-form').serializeArray());

                bodyJson = this.validateAndReformatData(bodyJson);

                if(!bodyJson)
                    return;

                $.ajax({
                    url: this.currentUser ? '/api/hml_reservation/' : '/api/purchase/',
                    method: 'post',
                    data: JSON.stringify(bodyJson),
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done(function(data) {
                    if(data.redirect)
                        window.location = data.redirect;
                    else
                        me.mainRadioChannel.trigger('reservation-changed', data.id);
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                });
            },
        });
    });
