define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'views/BaseView',
    'text!templates/unit_edit_view.tmpl',
    'leaflet'
    ],
    function(App, Backbone, Radio, bootbox, Marionette, $, BaseView, template, L) {
        return BaseView.extend({
            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
                this.unitCollection = this.options.unitCollection
            },

            events: {
                'click #unit-submit': 'saveUnit',
                'click #unit-cancel': 'viewResource',
                'click #unit-delete': 'deleteUnit',
                'change .required': 'checkRequired'
            },

            ui: {
                mapContainer: "#google-map"
            },

            render: function() {
                var me = this;
                var variables = {
                    unit: this.model,
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                setTimeout(function() {
                    me.setupMap();
                }, 10);
            },

            setupMap: function() {
                var me = this;
                var hml = {
                    lng: 24.4590,
                    lat: 60.9929
                }

                var cMarker = L.icon({
                    iconUrl:       '/static/img/marker-icon.png',
                    iconRetinaUrl: '/static/img/marker-icon-2x.png',
                    shadowUrl:     '/static/img/marker-shadow.png',
                    iconSize:    [25, 41],
                    iconAnchor:  [12, 41],
                    popupAnchor: [1, -34],
                    tooltipAnchor: [16, -28],
                    shadowSize:  [41, 41]
                });

                var modelLocation = this.model.getLocation();

                var map = L.map(this.$('#map')[0], {
                }).setView(modelLocation ? modelLocation : hml, 15);

                L.tileLayer.wms('https://kartta.hameenlinna.fi/teklaogcweb/WMS.ashx?', {
                    layers: 'Opaskartta'
                }).addTo(map);

                this.unitMarker = L.marker(modelLocation ? modelLocation : hml, {icon: cMarker}).addTo(map);

                map.on('click', function(e) {
                    if(me.unitMarker) {
                        map.removeLayer(me.unitMarker);
                    }
                    me.unitMarker = L.marker(e.latlng, {icon: cMarker}).addTo(map);
                    me.$('#unit-location').val(e.latlng.lng + ' ' + e.latlng.lat);
                });
            },

            viewResource: function(e) {
                e.preventDefault();
                window.App.router.navigate('unit-details/' + this.model.getId(), {trigger: true});
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
                            .fail(function(result) {
                                me.showRequestErrors(result.responseJSON);
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

                if(!data)
                    return;

                this.model.set('name', data.name);
                this.model.set('description', data.description);
                this.model.set('street_address', data.street_address);
                this.model.set('phone', data.phone);
                this.model.set('email', data.email);
                this.model.set('address_zip', data.address_zip);

                if(this.unitMarker) {
                    var location = {
                        coordinates: [this.unitMarker.getLatLng().lng, this.unitMarker.getLatLng().lat],
                        type: 'Point'
                    }
                    this.model.set('location', location);
                }

                this.model.save()
                .done(function() {
                    me.mainRadioChannel.trigger('unit-changed');
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                });
            },

            validateAndReformatData: function(data) {
                if(!this.checkRequired())
                    return false;

                data.street_address = {fi: data.street_address};
                data.name = {fi: data.name};
                data.description = {fi:data.description};

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
