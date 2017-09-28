define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'views/BaseView',
    'text!templates/unit_new_view.tmpl',
    'leaflet'
    ],
    function(App, Backbone, Radio, bootbox, Marionette, $, BaseView, template, L) {
        return BaseView.extend({
            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
            },

            ui: {
                mapContainer: "#google-map"
            },

            render: function() {
                var me = this;
                var variables = {
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                setTimeout(function() {
                    me.setupMap();
                }, 10);
            },

            setupMap: function() {
                var hml = {
                    lng: 24.4590,
                    lat: 60.9929
                }

                var cMarker = L.icon({
                    iconUrl:       '/img/marker-icon.png',
                    iconRetinaUrl: '/img/marker-icon-2x.png',
                    shadowUrl:     '/img/marker-shadow.png',
                    iconSize:    [25, 41],
                    iconAnchor:  [12, 41],
                    popupAnchor: [1, -34],
                    tooltipAnchor: [16, -28],
                    shadowSize:  [41, 41]
                });

                var me = this;
                var map = L.map(this.$('#map')[0], {
                    
                }).setView(hml, 13);

                L.tileLayer.wms('https://kartta.hameenlinna.fi/teklaogcweb/WMS.ashx?', {
                    layers: 'Opaskartta'
                }).addTo(map);

                map.on('click', function(e) {
                    if(me.unitMarker) {
                        map.removeLayer(me.unitMarker);
                    }
                    me.unitMarker = L.marker(e.latlng, {icon: cMarker}).addTo(map);
                    me.$('#unit-location').val(e.latlng.lng + ' ' + e.latlng.lat);
                });
            },

            events: {
                "click #unit-submit": "save",
                'change .required': 'checkRequired'
            },

            validateAndReformatData: function(data) {
                if(!this.checkRequired())
                    return false;
                
                data.street_address = {fi: data.street_address}
                data.name = {fi: data.name}
                data.description = {fi:data.description};
                if(this.unitMarker) {
                    data.location = {
                        coordinates: [this.unitMarker.getLatLng().lng, this.unitMarker.getLatLng().lat],
                        type: 'Point'
                    }
                }

                return data;
            },

            save: function(e) {
                e.preventDefault();
                var me = this;
                var bodyJson = this.objectifyForm($('#new-unit-form').serializeArray());

                bodyJson = this.validateAndReformatData(bodyJson);
                if(!bodyJson)
                    return;
                $.ajax({
                    url: '/api/unit/',
                    method: 'post',
                    data: JSON.stringify(bodyJson),
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done(function(data) {
                    me.mainRadioChannel.trigger('unit-changed', data.id);
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                });
            },
        });
    });