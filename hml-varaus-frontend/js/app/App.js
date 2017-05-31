define([
    'jquery', 
    'backbone',
    'backbone-radio',
    'marionette', 
    'underscore',
    'routers/AppRouter',
    'views/LayoutView',
    'views/WelcomeView',
    'views/BoatManageView',
    'views/BoatReservationListView',
    'views/BoatResourceListView',
    'views/BoatNewReservationView',
    'views/BoatNewResourceView',
    'views/BoatReservationDetailsView',
    'views/BoatResourceDetailsView',
    'views/BoatResourceEditView',
    'views/UnitEditView',
    'views/UnitDetailsView',
    'views/UnitNewView',
    'views/ContentTableView',
    'collections/BoatResourceCollection',
    'collections/BoatReservationCollection',
    'collections/UserCollection',
    'collections/UnitCollection',
    '../libs/require',
    'launcher'
    ],
    function ($, Backbone, Radio, Marionette, _, Router, LayoutView, WelcomeView, BoatManageView, 
    BoatReservationListView, BoatResourceListView, BoatNewReservationView, BoatNewResourceView,
    BoatReservationDetailsView, BoatResourceDetailsView, BoatResourceEditView, 
    UnitEditView, UnitDetailsView, UnitNewView, ContentTableView,
    BoatResourceCollection, BoatReservationCollection, UserCollection, UnitCollection) {

        var App = new Marionette.Application({
            region: '#root',

            navigate: function(fragment) {
                this.router.navigate(fragment, {trigger: true});
            },
            
            onStart: function() {
                var me = this;
                this.router = new Router({
                    controller: this
                });

                this.boatResourceCollection = new BoatResourceCollection();
                this.boatReservationCollection = new BoatReservationCollection();
                this.unitCollection = new UnitCollection();

                this.mainRadioChannel = Radio.channel('main');

                this.mainRadioChannel.on('reservation-changed', function(id) {
                    var url = 'boat-reservations';
                    if(id) {
                        url = 'boat-reservation-details/' + id;
                    } 
                    me.boatResourceCollection.fetch();
                    me.boatReservationCollection.fetch().done(function(){
                        me.router.navigate(url, {trigger: true});
                        $('.main-nav-item.active').removeClass('active');
                        $('#nav-reservations').addClass('active'); 
                    });
                });

                this.mainRadioChannel.on('resource-changed', function(id) {
                    var url = 'boat-resources';
                    if(id) {
                        url = 'boat-resource-details/' + id;
                    } 
                    me.boatReservationCollection.fetch();
                    me.boatResourceCollection.fetch().done(function() {
                        me.router.navigate(url, {trigger: true});
                        $('.main-nav-item.active').removeClass('active');
                        $('#nav-resources').addClass('active'); 
                    });
                });

                this.mainRadioChannel.on('unit-changed', function(id) {
                    var url = 'units';
                    if(id) {
                        url = 'unit-details/' + id;
                    } 
                    me.unitCollection.fetch().done(function() {
                        me.router.navigate(url, {trigger: true});
                        $('.main-nav-item.active').removeClass('active');
                        $('#nav-units').addClass('active'); 
                    });
                });

                this.mainRadioChannel.on('show-reservations', function() {
                    me.router.navigate('boat-reservations', {trigger: true});
                    $('.main-nav-item.active').removeClass('active');
                    $('#nav-reservations').addClass('active'); 
                });

                this.mainRadioChannel.on('show-resources', function() {
                    me.router.navigate('boat-resources', {trigger: true});
                    $('.main-nav-item.active').removeClass('active');
                    $('#nav-resources').addClass('active'); 
                });

                this.mainRadioChannel.on('show-new-reservation', function(id) {
                    var url = 'boat-reservation-new';
                    if(id) {
                        url += '/' + id;
                    } 
                    me.router.navigate(url, {trigger: true});
                    $('.main-nav-item.active').removeClass('active');
                    $('#nav-reservations').addClass('active'); 
                });

                this.layoutView = new LayoutView()
                me.showView(this.layoutView);
                Backbone.history.start();
            },

        });

        _.templateSettings = {
            interpolate: /\{\{(.+?)\}\}/g,
            evaluate: /\<\%(.+?)\%\>/g
        };

        Backbone.emulateJSON = false;

        window.App = App;

        App.showTest = function() {
            App.layoutView.showChildView('contentRegion', new WelcomeView());
        }

        App.refetchFilteredCollections = function() {
            if(App.boatResourceCollection.isFiltered) {
                App.boatResourceCollection.fetchAll();
            }
            if(App.boatReservationCollection.isFiltered) {
                App.boatReservationCollection.fetchAll();
            }
            if(App.unitCollection.isFiltered) {
                App.unitCollection.fetchAll();
            }
        }

        App.showBoatManage = function() {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatManageView({
                    boatReservationCollection: App.boatReservationCollection,
                    boatResourceCollection: App.boatResourceCollection
                }));
            });
        }

        App.showBoatReservationList = function() {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new ContentTableView({
                    collection: App.boatReservationCollection,
                    contentType: 'boatReservations',
                    unitCollection: App.unitCollection
                }));
            });
        }

        App.showBoatReservationNew = function(id) {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatNewReservationView({
                    boatResourceCollection: App.boatResourceCollection,
                    boatReservationCollection: App.boatReservationCollection,
                    unitCollection: App.unitCollection,
                    resourceId: id
                }));
            });
        }

        App.showBoatReservationDetails = function(id) {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatReservationDetailsView({
                    model: App.boatReservationCollection.get(id),
                    resourceCollection: App.boatResourceCollection
                }));
            });
        }

        App.showBoatResourceList = function() {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new ContentTableView({
                    collection: App.boatResourceCollection,
                    contentType: 'boatResources',
                    unitCollection: App.unitCollection
                }));
            });
        }

        App.showBoatResourceNew = function() {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatNewResourceView({
                    boatResourceCollection: App.boatResourceCollection,
                    boatReservationCollection: App.boatReservationCollection,
                    unitCollection: App.unitCollection
                }));
            });
        }

        App.showBoatResourceDetails = function(id) {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatResourceDetailsView({
                    model: App.boatResourceCollection.get(id),
                    unitCollection: App.unitCollection,
                    boatReservationCollection: App.boatReservationCollection
                }));
            });
        }

        App.showBoatResourceEdit = function(id) {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatResourceEditView({
                    model: App.boatResourceCollection.get(id),
                    unitCollection: App.unitCollection
                }));
            });
        }

        App.showUnitList = function() {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new ContentTableView({
                    collection: App.unitCollection,
                    contentType: 'units'
                }));
            });
        }

        App.showUnitDetails = function(id) {
            App.refetchFilteredCollections();
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new UnitDetailsView({
                    model: App.unitCollection.get(id)
                }));
            });
        }

        App.showUnitNew = function() {
            App.layoutView.showChildView('contentRegion', new UnitNewView());
        }

        App.showUnitEdit = function(id) {
            App.refetchFilteredCollections();
            $.when(App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new UnitEditView({
                    model: App.unitCollection.get(id)
                }));
            });
        }

        App.start();

        return App;
    });

