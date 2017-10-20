define( ['App', 'backbone', 'backbone-radio', 'marionette', 'jquery', 'moment', 'text!templates/boat_manage_view.tmpl'],
    function(App, Backbone, Radio, Marionette, $, moment, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.userCollection = window.App.userCollection;
                this.currentUser = this.userCollection.currentUser;
                this.boatReservationCollection = this.options.boatReservationCollection;
                this.boatResourceCollection = this.options.boatResourceCollection;
                this.unitCollection = this.options.unitCollection;
                this.listenTo(this.boatReservationCollection, 'sync', this.render);
                this.listenTo(this.boatResourceCollection, 'sync', this.render);
                this.mainRadioChannel = Radio.channel('main');
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
                var freeBoatResources = 0;

                this.boatResourceCollection.each(function(resource) {
                    if(!resource.isReserved(me.boatReservationCollection))
                        freeBoatResources++;
                });

                var currentFutureReservations = 0;
                this.boatReservationCollection.each(function(res) {
                    if(moment().isBefore(moment(res.getEndTime())) && res.getState() == 'confirmed')
                        currentFutureReservations++;
                });

                var data = {
                    boat_resources: this.boatResourceCollection.length,
                    current_or_future_reservations: currentFutureReservations,
                    free_boat_resources: freeBoatResources
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

                var map = L.map(this.$('#map')[0], {
                }).setView(hml, 10);

                L.tileLayer.wms('https://kartta.hameenlinna.fi/teklaogcweb/WMS.ashx?', {
                    layers: 'Opaskartta'
                }).addTo(map);


                this.unitCollection.each(function(unit) {
                    var toolTip = L.tooltip({
                        permament: true
                    }, marker);

                    var boatResourceCount = 0;
                    me.boatResourceCollection.each(function(resource) {
                        if(resource.getUnit() == unit.getId())
                            boatResourceCount++;
                    });

                    var toolTipContent = '<div><h4>' + unit.getName() + '</h4><p>Venepaikkoja: ' + boatResourceCount + '</p></div>';
                    var modelLocation = unit.getLocation();
                    var marker = L.marker(modelLocation ? modelLocation : hml, {icon: cMarker}).bindTooltip(toolTipContent, toolTip).openTooltip().addTo(map);

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