define( ['App',
    'backbone',
    'backbone-radio',
    'marionette',
    'jquery',
    'text!templates/unit_new_view.tmpl'],
    function(App, Backbone, Radio, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
            },

            render: function() {
                var variables = {
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            },

            events: {
                "click #unit-submit": "save"
            },

            validateAndReformatData: function(data) {
                data.street_address = {fi: data.street_address}
                data.name = {fi: data.name}

                return data;
            },

            save: function(e) {
                e.preventDefault();
                var me = this;
                var bodyJson = this.objectifyForm($('#new-unit-form').serializeArray());

                bodyJson = this.validateAndReformatData(bodyJson);
                
                $.ajax({
                    url: '/api/unit/',
                    method: 'post',
                    data: JSON.stringify(bodyJson),
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done(function() {
                    me.mainRadioChannel.trigger('unit-changed');
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