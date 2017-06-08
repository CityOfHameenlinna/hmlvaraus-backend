define( ['App',
    'backbone',
    'marionette',
    'jquery',
    'text!templates/unit_details_view.tmpl',
    'leaflet'
    ],
    function(App, Backbone, Marionette, $, template, L) {
        return Marionette.View.extend({
            initialize: function() {
            },
            events: {
                'click #unit-edit': 'editUnit'
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
                    iconUrl:       '/img/marker-icon.png',
                    iconRetinaUrl: '/img/marker-icon-2x.png',
                    shadowUrl:     '/img/marker-shadow.png',
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

                var marker = L.marker(modelLocation ? modelLocation : hml, {icon: cMarker}).addTo(map);
            },

            editUnit: function() {
                window.App.router.navigate('unit-edit/' + this.model.getId(), {trigger: true});
            }
        });
    });