define( [
    'App', 
    'backbone', 
    'marionette', 
    'jquery', 
    'views/BoatReservationListView',
    'views/BoatResourceListView',
    'views/ContentFilterView',
    'text!templates/content_table_view.tmpl',
    'text!templates/boat_reservation_table_headers.tmpl',
    'text!templates/boat_resource_table_headers.tmpl',
    ],
    function(App, Backbone, Marionette, $, BoatReservationListView, BoatResourceListView, ContentFilterView, template, boatReservationHeaderTmpl, boatResourceHeaderTmpl) {
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

                if(this.contentType == 'boatReservations') {
                    this.$('thead').empty().append(boatReservationHeaderTmpl);

                    this.showChildView('bodyRegion', new BoatReservationListView({
                        collection: this.collection
                    }));
                }
                else if(this.contentType == 'boatResources') {
                    this.$('thead').empty().append(boatResourceHeaderTmpl);

                    this.showChildView('bodyRegion', new BoatResourceListView({
                        collection: this.collection
                    }));
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