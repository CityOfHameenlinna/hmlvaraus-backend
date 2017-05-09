define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'text!templates/boat_resource_edit_view.tmpl'],
    function(App, Backbone, Radio, bootbox, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
                this.unitCollection = this.options.unitCollection
            },
            events: {
                'click #resource-submit': 'saveResource',
                'click #resource-delete': 'deleteResource'
            },
            render: function() {
                var variables = {
                    resource: this.model,
                    unit_collection: this.unitCollection
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            },
            deleteResource: function(e) {
                var me = this;
                e.preventDefault();

                bootbox.confirm({
                    message: "Olet poistamassa venepaikkaa. Kaikki venepaikan varaukset poistuvat samalla. Oletko varma?",
                    buttons: {
                        confirm: {
                            label: 'Poista',
                            className: 'btn-danger'
                        },
                        cancel: {
                            label: 'Peruuta',
                            className: 'btn-default'
                        }
                    },
                    callback: function (result) {
                        if(result) {
                            me.model.destroy()
                            .done(function() {
                                me.mainRadioChannel.trigger('resource-changed');
                            })
                            .fail(function() {

                            });
                        }
                    }
                });
                            },
            saveResource: function(e) {
                var me = this;
                e.preventDefault();
                var data = this.objectifyForm($('#edit-resource-form').serializeArray());
                data = this.validateAndReformatData(data);

                this.model.set('depth_cm', data.depth_cm);
                this.model.set('width_cm', data.width_cm);
                this.model.set('length_cm', data.length_cm);
                this.model.set('type', data.type);

                var resource = this.model.get('resource');

                resource.name.fi = data.resource.name;
                resource.unit_id = data.resource.unit_id;

                this.model.set('resource', resource);

                this.model.save()
                .done(function() {
                    me.mainRadioChannel.trigger('resource-changed');
                })
                .fail(function() {

                });
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