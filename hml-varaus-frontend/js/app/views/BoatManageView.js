define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/boat_manage_view.tmpl'],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.boatReservationCollection = this.options.boatReservationCollection;
                this.boatResourceCollection = this.options.boatResourceCollection;

                this.listenTo(this.boatReservationCollection, 'sync', this.render);
                this.listenTo(this.boatResourceCollection, 'sync', this.render);
            },

            createManageData: function() {
                var me = this;
                var freeBoatResources = 0;

                this.boatResourceCollection.each(function(resource) {
                    if(!resource.isReserved(me.boatReservationCollection))
                        freeBoatResources++;
                });

                var data = {
                    boat_resources: this.boatResourceCollection.length,
                    current_or_future_reservations: this.boatReservationCollection.length,
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