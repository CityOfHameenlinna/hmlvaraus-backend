define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'text!templates/unit_edit_view.tmpl'],
    function(App, Backbone, Radio, bootbox, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
                this.unitCollection = this.options.unitCollection
            },
            events: {
                'click #unit-submit': 'saveUnit',
                'click #unit-delete': 'deleteUnit'
            },
            render: function() {
                var variables = {
                    unit: this.model,
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            },
            deleteUnit: function(e) {
                var me = this;
                e.preventDefault();

                bootbox.confirm({
                    message: "Olet poistamassa kohdetta. Kaikki kohteen venepaikat ja niiden varaukset poistuvat samalla. Oletko varma?",
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
                                me.mainRadioChannel.trigger('unit-changed');
                            })
                            .fail(function() {

                            });
                        }
                    }
                });
            },
            saveUnit: function(e) {
                e.preventDefault();
                var me = this;
                
                var data = this.objectifyForm($('#edit-unit-form').serializeArray());
                data = this.validateAndReformatData(data);

                this.model.set('name', data.name);
                this.model.set('street_address', data.street_address);
                this.model.set('phone', data.phone);
                this.model.set('email', data.email);
                this.model.set('address_zip', data.address_zip);

                this.model.save()
                .done(function() {
                    me.mainRadioChannel.trigger('unit-changed');
                })
                .fail(function() {

                });
            },
            validateAndReformatData: function(data) {
                data.street_address = {fi: data.street_address}
                data.name = {fi: data.name}

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