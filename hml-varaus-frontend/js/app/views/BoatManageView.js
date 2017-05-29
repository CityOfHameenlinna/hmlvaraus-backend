define( ['App', 'backbone', 'backbone-radio', 'marionette', 'jquery', 'moment', 'text!templates/boat_manage_view.tmpl'],
    function(App, Backbone, Radio, Marionette, $, moment, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.boatReservationCollection = this.options.boatReservationCollection;
                this.boatResourceCollection = this.options.boatResourceCollection;
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
                    if(moment().isBefore(moment(res.getEndTime())))
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
                var variables = {
                    data: this.createManageData()
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            }

        });
    });