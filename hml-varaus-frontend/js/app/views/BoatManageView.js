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
                this.filters = {};
                this.unitCollection.fetch();
                this.listenTo(this.unitCollection, 'sync', this.render);
                this.listenTo(this.boatReservationCollection, 'sync', this.render);
                this.mainRadioChannel = Radio.channel('main');

                this.mainRadioChannel.on('resource-filter-changed', function(filters) {
                    me.filters = filters;
                    me.setupMap();
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
                resourcesCount = 0;
                freeResourcesCount = 0;
                currentFutureReservationsCount = 0;

                this.unitCollection.each(function(unit) {
                    var resources = unit.get('resources');
                    $(resources).each(function(index) {
                        if (!this.reservable) {
                            currentFutureReservationsCount++
                        }
                    });
                    resourcesCount += unit.getResourcesCount()
                    freeResourcesCount += unit.getResourcesReservableCount()
                });
                var data = {
                    boat_resources: resourcesCount,
                    current_or_future_reservations: currentFutureReservationsCount,
                    free_boat_resources: freeResourcesCount
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
                if(!localStorage.getItem('boat_resource_filters'))
                    localStorage.setItem('boat_resource_filters', JSON.stringify({}));
                var unitFilter = JSON.parse(localStorage.getItem('boat_resource_filters')).unit_id;
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

                var options = {
                    maxZoom: 16,
                    minZoom: 9,
                    scrollWheelZoom: false
                };

                if (this.map) {
                    this.map.removeLayer(this.markerLayer);
                    this.markerLayer = L.layerGroup().addTo(me.map);
                }
                else {
                    this.map = L.map(this.$('#map')[0], options).setView(me.hml, 10);
                    L.tileLayer.wms('https://kartta.hameenlinna.fi/teklaogcweb/WMS.ashx?', {
                        layers: 'Opaskartta'
                    }).addTo(me.map);
                    this.markerLayer = L.layerGroup().addTo(me.map);
                }

                if (unitFilter) {
                    var units = [];
                    units.push(this.unitCollection.get(unitFilter));
                    var unitMarkers = $(units);
                }
                else {
                    var unitMarkers = this.unitCollection;
                }

                unitMarkers.each(function(unit, unitHelper) {
                    if (!unit) {
                      unit = unitHelper;
                    }

                    if(unit.getName().toLowerCase().indexOf('poletti') > -1)
                        return;

                    var toolTip = L.tooltip({
                        permament: true
                    }, marker);

                    var boatResourceCount = '<p>Venepaikkoja: ' + unit.getResourcesCount() + '</p>';
                    var boatResourceReservableCount = '<p>Vapaana: ' + unit.getResourcesReservableCount() + '</p>';

                    var toolTipContent = '<div><h4>' + unit.getName() + '</h4>' + boatResourceCount + boatResourceReservableCount + '</div>';
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
