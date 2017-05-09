define( ['App',
    'backbone',
    'backbone-radio',
    'marionette',
    'jquery',
    'text!templates/boat_new_resource_view.tmpl'],
    function(App, Backbone, Radio, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.unitCollection = this.options.unitCollection;
                this.mainRadioChannel = Radio.channel('main');
            },

            render: function() {
                var variables = {
                    unit_collection: this.unitCollection
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            },

            events: {
                "click #resource-submit": "save"
            },

            validateAndReformatData: function(data) {
                data.resource = {
                    name: data.name,
                    name_fi: data.name,
                    type_id: 'avggovhcw76q',
                    slug: data.name,
                    unit_id: data.unit,
                    authentication: 'none'
                }
                delete data.name;
                delete data.unit;
                data.length_cm = Number(data.length_cm) * 100;
                data.width_cm = Number(data.width_cm) * 100;
                data.depth_cm = Number(data.depth_cm) * 100;

                return data;
            },

            save: function(e) {
                var me = this;
                e.preventDefault();
                var bodyJson = this.objectifyForm($('#new-resource-form').serializeArray());

                bodyJson = this.validateAndReformatData(bodyJson);
                
                $.ajax({
                    url: '/api/berth/',
                    method: 'post',
                    data: JSON.stringify(bodyJson),
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done(function() {
                    me.mainRadioChannel.trigger('resource-changed');
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