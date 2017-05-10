define( [
    'App', 
    'backbone', 
    'marionette', 
    'jquery', 
    'views/BoatReservationListView',
    'views/BoatResourceListView',
    'views/UnitListView',
    'views/ContentFilterView',
    'text!templates/content_table_view.tmpl',
    'text!templates/boat_reservation_table_headers.tmpl',
    'text!templates/boat_resource_table_headers.tmpl',
    'text!templates/unit_table_headers.tmpl',
    ],
    function(App, Backbone, Marionette, $, BoatReservationListView, BoatResourceListView, UnitListView, ContentFilterView, template, boatReservationHeaderTmpl, boatResourceHeaderTmpl, unitHeaderTmpl) {
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
                this.listenTo(this.collection, "sync", this.render);
            },

            showChildViews: function() {
                this.showChildView('filterRegion', new ContentFilterView());

                switch(this.contentType) {
                    case 'boatReservations':
                        this.$('thead').empty().append(boatReservationHeaderTmpl);

                        this.showChildView('bodyRegion', new BoatReservationListView({
                            collection: this.collection
                        }));
                        break;
                    case 'boatResources':
                        this.$('thead').empty().append(boatResourceHeaderTmpl);

                        this.showChildView('bodyRegion', new BoatResourceListView({
                            collection: this.collection
                        }));
                        break;
                    case 'units':
                        this.$('thead').empty().append(unitHeaderTmpl);

                        this.showChildView('bodyRegion', new UnitListView({
                            collection: this.collection
                        }));
                        break;
                }
            },

            render: function() {
                var variables = {}

                var tmpl = _.template(template)

                this.$el.html(tmpl(variables));

                this.showChildViews();
            }
        }
    );
    });