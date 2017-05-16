define( [
    'App', 
    'backbone', 
    'marionette', 
    'jquery', 
    'views/BoatReservationListView',
    'views/BoatResourceListView',
    'views/UnitListView',
    'views/ResourceFilterView',
    'views/ReservationFilterView',
    'views/UnitFilterView',
    'text!templates/content_table_view.tmpl',
    'text!templates/boat_reservation_table_headers.tmpl',
    'text!templates/boat_resource_table_headers.tmpl',
    'text!templates/unit_table_headers.tmpl',
    ],
    function(App, Backbone, Marionette, $, BoatReservationListView, BoatResourceListView, UnitListView, ResourceFilterView, ReservationFilterView, UnitFilterView, template, boatReservationHeaderTmpl, boatResourceHeaderTmpl, unitHeaderTmpl) {
        return Marionette.View.extend({
            tagName: 'div',
            template: template,

            regions: {
                bodyRegion: {
                    el: 'tbody',
                    replaceElement: true
                },
                filterRegion: {
                    el: '#filter-container',
                    replaceElement: true
                }
            },

            initialize: function() {
                this.contentType = this.options.contentType;
                this.collection = this.options.collection;
                this.collection.fetchFiltered()
            },

            showChildViews: function() {
                switch(this.contentType) {
                    case 'boatReservations':
                        this.showChildView('filterRegion', new ReservationFilterView(this.options));
                        this.$('thead').empty().append(boatReservationHeaderTmpl);
                        this.showChildView('bodyRegion', new BoatReservationListView(this.options));
                        break;
                    case 'boatResources':
                        this.showChildView('filterRegion', new ResourceFilterView(this.options));
                        this.$('thead').empty().append(boatResourceHeaderTmpl);
                        this.showChildView('bodyRegion', new BoatResourceListView(this.options));
                        break;
                    case 'units':
                        this.showChildView('filterRegion', new UnitFilterView(this.options));
                        this.$('thead').empty().append(unitHeaderTmpl);
                        this.showChildView('bodyRegion', new UnitListView(this.options));
                        break;
                }
            },
            
            render: function() {
                var me = this;
                var variables = {}

                var tmpl = _.template(template);
                me.$el.html(tmpl(variables));
                me.showChildViews();
            }
        }
    );
    });