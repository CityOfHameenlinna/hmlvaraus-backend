define( [
    'App',
    'backbone',
    'backbone-radio',
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
    function(App, Backbone, Radio, Marionette, $, BoatReservationListView, BoatResourceListView, UnitListView, ResourceFilterView, ReservationFilterView, UnitFilterView, template, boatReservationHeaderTmpl, boatResourceHeaderTmpl, unitHeaderTmpl) {
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
                this.userCollection = window.App.userCollection;
                this.currentUser = this.userCollection.currentUser;

                this.collection = this.options.collection;
                this.collection.fetchFiltered();

                this.mainRadioChannel = Radio.channel('main');
                this.contentType = this.options.contentType;

                this.filterTag = '';
                this.eventTag = '';
                switch(this.contentType) {
                    case 'boatReservations':
                        filterTag = 'boat_reservation_filters';
                        eventTag = 'reservation-filter-changed';
                        break;
                    case 'boatResources':
                        filterTag = 'boat_resource_filters';
                        eventTag = 'resource-filter-changed';
                        break;
                    case 'units':
                        filterTag = 'unit_filters';
                        eventTag = 'unit-filter-changed';
                        break;
                }
            },

            events: {
                'click th': 'sortChanged',
                'click #pagination-next': 'paginationNext',
                'click #pagination-previous': 'paginationPrevious'
            },

            showChildViews: function() {
                switch(this.contentType) {
                    case 'boatReservations':
                        this.showChildView('filterRegion', new ReservationFilterView(this.options));
                        this.$('thead').empty().append(boatReservationHeaderTmpl);
                        this.setOrderingArrow();
                        this.showChildView('bodyRegion', new BoatReservationListView(this.options));
                        break;
                    case 'boatResources':
                        this.showChildView('filterRegion', new ResourceFilterView(this.options));
                        this.$('thead').empty().append(boatResourceHeaderTmpl);
                        this.setOrderingArrow();
                        this.showChildView('bodyRegion', new BoatResourceListView(this.options));
                        break;
                    case 'units':
                        this.showChildView('filterRegion', new UnitFilterView(this.options));
                        this.$('thead').empty().append(unitHeaderTmpl);
                        this.setOrderingArrow();
                        this.showChildView('bodyRegion', new UnitListView(this.options));
                        break;
                }
            },

            setOrderingArrow: function() {
                var filterData = localStorage.getItem(filterTag);
                if(filterData) {
                    var filters = JSON.parse(filterData);
                }
                else
                    return;
                var ordering = filters.ordering;

                if(!ordering)
                    return;

                if(ordering.substring(0, 1) == '-')
                    this.$('th[name="' + ordering.substring(1, 100) + '"]').find('.ordering-icon').addClass('glyphicon-triangle-bottom');
                else
                    this.$('th[name="' + ordering + '"]').find('.ordering-icon').addClass('glyphicon-triangle-top');

            },

            sortChanged: function(e) {
                var target = $(e.currentTarget);
                var icon = target.find('.ordering-icon');
                $('.ordering-icon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
                var ordering = target.attr('name');
                var filterData = localStorage.getItem(filterTag);
                if(filterData) {
                    var filters = JSON.parse(filterData);
                }
                else
                    var filters = {};

                if(filters.ordering && filters.ordering == ordering) {
                    icon.addClass('glyphicon-triangle-bottom');
                    ordering = '-' + ordering;
                }
                else if(filters.ordering && filters.ordering.substring(1, 100) == ordering) {
                    ordering = '';
                }
                else {
                    icon.addClass('glyphicon-triangle-top');
                }

                filters.ordering = ordering;

                localStorage.setItem(filterTag, JSON.stringify(filters));

                this.mainRadioChannel.trigger(eventTag);
            },

            paginationNext: function(e) {
                this.collection.fetchFiltered({
                  page: this.collection.nextPage,
                  reset: false,
                  remove: true,
                });
            },

            paginationPrevious: function(e) {
                this.collection.fetchFiltered({
                  page: this.collection.previousPage,
                  reset: false,
                  remove: true,
                });
            },

            render: function() {
                var me = this;
                var variables = {
                    currentUser: this.currentUser,
                    content_type: this.contentType
                }

                var tmpl = _.template(template);
                me.$el.html(tmpl(variables));
                me.showChildViews();
            }
        }
    );
    });
