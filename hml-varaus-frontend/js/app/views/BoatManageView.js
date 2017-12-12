define( ['App', 'backbone', 'backbone-radio', 'marionette', 'jquery', 'moment', 'text!templates/boat_manage_view.tmpl', 'views/BoatManageResourceFilterView'],
    function(App, Backbone, Radio, Marionette, $, moment, template, BoatManageResourceFilterView) {
        return Marionette.View.extend({
          regions: {
              filterRegion: {
                  el: '#filter-container',
                  replaceElement: true
              }
          },
            initialize: function() {
                var me = this;
                this.userCollection = window.App.userCollection;
                this.currentUser = this.userCollection.currentUser;
                this.boatReservationCollection = this.options.boatReservationCollection;
                this.boatResourceCollection = this.options.boatResourceCollection;
                this.unitCollection = this.options.unitCollection;
                this.unitCollection.fetch();
                this.listenTo(this.unitCollection, 'sync', this.render);
                this.listenTo(this.boatReservationCollection, 'sync', this.render);
                this.mainRadioChannel = Radio.channel('main');

                this.mainRadioChannel.on('resource-filter-changed', function(filters) {
                    me.filters = filters;
                    me.refreshMap();
                });

                this.hml = undefined;
                this.cMarker = undefined;
                this.map = undefined;
                this.markerLayer = undefined;
            },

            events: {
                'click #boat-resources-total': 'showBoatResourcesTotal',
                'click #boat-resources-free': 'showBoatResourcesFree',
                'click #boat-reservations-current-future': 'showBoatReservationCurrentFuture'
            },

            showBoatResourcesTotal: function(e) {
                var filters = {
                    show: true
                };
                localStorage.setItem('boat_resource_filters', JSON.stringify(filters));
                this.mainRadioChannel.trigger('show-resources');
            },

            showBoatResourcesFree: function(e) {
                var filters = {
                    show: true,
                    berth_begin: moment().toISOString(),
                    berth_end: moment().toISOString(),
                    date_filter_type: 'not_reserved'
                };
                localStorage.setItem('boat_resource_filters', JSON.stringify(filters));
                this.mainRadioChannel.trigger('show-resources');
            },

            showBoatReservationCurrentFuture: function(e) {
                var filters = {
                    show: true,
                    begin: moment().toISOString()
                };
                localStorage.setItem('boat_reservation_filters', JSON.stringify(filters));
                this.mainRadioChannel.trigger('show-reservations');
            },

            createManageData: function() {
                var me = this;
                resourcesList = [];
                freeResourcesList = [];
                currentFutureReservationsList = [];

                this.unitCollection.each(function(unit) {
                    var resources = unit.get('resources');
                    $(resources).each(function(index) {
                        if (this.reservable) {
                            freeResourcesList.push(this);
                        }
                        else if (!this.reservable) {
                            currentFutureReservationsList.push(this);
                        }
                        resourcesList.push(this);
                    });
                });
                var data = {
                    boat_resources: resourcesList.length,
                    current_or_future_reservations: currentFutureReservationsList.length,
                    free_boat_resources: freeResourcesList.length
                }

                return data;
            },

            render: function() {
                var me = this;
                var variables = {
                    currentUser: this.currentUser,
                    data: this.createManageData()
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                setTimeout(function() {
                    me.listenTo(me.unitCollection, 'sync', me.setupMap);
                }, 10);
            },

            setupMap: function() {
                this.showChildView('filterRegion', new BoatManageResourceFilterView(this.options));
                var me = this;
                this.hml = {
                    lng: 24.4590,
                    lat: 60.9929
                }

                this.cMarker = L.icon({
                    iconUrl:       '/static/img/marker-icon.png',
                    iconRetinaUrl: '/static/img/marker-icon-2x.png',
                    shadowUrl:     '/static/img/marker-shadow.png',
                    iconSize:    [25, 41],
                    iconAnchor:  [12, 41],
                    popupAnchor: [1, -34],
                    tooltipAnchor: [16, -28],
                    shadowSize:  [41, 41]
                });

                this.map = L.map(this.$('#map')[0], {
                }).setView(me.hml, 10);

                L.tileLayer.wms('https://kartta.hameenlinna.fi/teklaogcweb/WMS.ashx?', {
                    layers: 'Opaskartta'
                }).addTo(me.map);

                this.markerLayer = L.layerGroup().addTo(me.map);

                this.unitCollection.each(function(unit) {
                    var toolTip = L.tooltip({
                        permament: true
                    }, marker);

                    var boatResourceCount = unit.get('resources').length;

                    var toolTipContent = '<div><h4>' + unit.getName() + '</h4><p>Venepaikkoja: ' + boatResourceCount + '</p></div>';
                    var modelLocation = unit.getLocation();
                    var marker = L.marker(modelLocation ? modelLocation : me.hml, {icon: me.cMarker}).bindTooltip(toolTipContent, toolTip).openTooltip().addTo(me.markerLayer);

                    marker.on('click', function(e) {
                        var filters = {
                            show: true,
                            unit_id: unit.getId()
                        };
                        localStorage.setItem('boat_resource_filters', JSON.stringify(filters));
                        me.mainRadioChannel.trigger('show-resources');
                    });
                });
            },

            refreshMap: function() {
                var me = this;

                var units = [];
                if (this.filters.unit_id) {
                    units.push(this.unitCollection.get(this.filters.unit_id));
                }

                this.map.removeLayer(this.markerLayer);
                this.markerLayer = L.layerGroup().addTo(me.map);

                $(units).each(function(index, unit) {
                    var toolTip = L.tooltip({
                        permament: true
                    }, marker);

                    var boatResourceCount = unit.get('resources').length;

                    var toolTipContent = '<div><h4>' + unit.getName() + '</h4><p>Venepaikkoja: ' + boatResourceCount + '</p></div>';
                    var modelLocation = unit.getLocation();
                    var marker = L.marker(modelLocation ? modelLocation : me.hml, {icon: me.cMarker}).bindTooltip(toolTipContent, toolTip).openTooltip().addTo(me.markerLayer);

                    marker.on('click', function(e) {
                        var filters = {
                            show: true,
                            unit_id: unit.getId()
                        };
                        localStorage.setItem('boat_resource_filters', JSON.stringify(filters));
                        me.mainRadioChannel.trigger('show-resources');
                    });
                });
            },

        });
    });
