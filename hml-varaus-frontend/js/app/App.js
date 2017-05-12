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
    'collections/UnitCollection'
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
                this.userCollection = new UserCollection();
                this.unitCollection = new UnitCollection();

                this.mainRadioChannel = Radio.channel('main');

                this.mainRadioChannel.on("reservation-added", function() {
                    me.boatResourceCollection.fetch();
                    me.boatReservationCollection.fetch().done(function(){
                        me.router.navigate('boat-reservations', {trigger: true});
                        $('.main-nav-item.active').removeClass('active');
                        $('a[href="' + location.hash + '"]').closest('.main-nav-item').addClass('active'); 
                    });
                });

                this.mainRadioChannel.on("resource-changed", function() {
                    me.boatReservationCollection.fetch();
                    me.boatResourceCollection.fetch().done(function() {
                        me.router.navigate('boat-resources', {trigger: true});
                        $('.main-nav-item.active').removeClass('active');
                        $('a[href="' + location.hash + '"]').closest('.main-nav-item').addClass('active'); 
                    });
                });

                this.mainRadioChannel.on("unit-changed", function() {
                    me.unitCollection.fetch().done(function() {
                        me.router.navigate('units', {trigger: true});
                        $('.main-nav-item.active').removeClass('active');
                        $('a[href="' + location.hash + '"]').closest('.main-nav-item').addClass('active'); 
                    });
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

        App.showBoatManage = function() {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatManageView({
                    boatReservationCollection: App.boatReservationCollection,
                    boatResourceCollection: App.boatResourceCollection
                }));
            });
        }

        App.showBoatReservationList = function() {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new ContentTableView({
                    collection: App.boatReservationCollection,
                    contentType: "boatReservations"
                }));
            });
        }

        App.showBoatReservationNew = function() {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatNewReservationView({
                    boatResourceCollection: App.boatResourceCollection,
                    boatReservationCollection: App.boatReservationCollection,
                    userCollection: App.userCollection
                }));
            });
        }

        App.showBoatReservationDetails = function(id) {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatReservationDetailsView({
                    model: App.boatReservationCollection.get(id),
                    resourceCollection: App.boatResourceCollection
                }));
            });
        }

        App.showBoatResourceList = function() {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new ContentTableView({
                    collection: App.boatResourceCollection,
                    contentType: "boatResources"
                }));
            });
        }

        App.showBoatResourceNew = function() {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatNewResourceView({
                    boatResourceCollection: App.boatResourceCollection,
                    boatReservationCollection: App.boatReservationCollection,
                    userCollection: App.userCollection,
                    unitCollection: App.unitCollection
                }));
            });
        }

        App.showBoatResourceDetails = function(id) {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatResourceDetailsView({
                    model: App.boatResourceCollection.get(id),
                    unitCollection: App.unitCollection
                }));
            });
        }

        App.showBoatResourceEdit = function(id) {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new BoatResourceEditView({
                    model: App.boatResourceCollection.get(id),
                    unitCollection: App.unitCollection
                }));
            });
        }

        App.showUnitList = function() {
            $.when(App.boatResourceCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new ContentTableView({
                    collection: App.unitCollection,
                    contentType: "units"
                }));
            });
        }

        App.showUnitDetails = function(id) {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new UnitDetailsView({
                    model: App.unitCollection.get(id)
                }));
            });
        }

        App.showUnitNew = function() {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new UnitNewView({
                }));
            });
        }

        App.showUnitEdit = function(id) {
            $.when(App.boatResourceCollection.deferred, App.boatReservationCollection.deferred, App.userCollection.deferred, App.unitCollection.deferred).done(function() {
                App.layoutView.showChildView('contentRegion', new UnitEditView({
                    model: App.unitCollection.get(id)
                }));
            });
        }

        App.start();

        return App;
    });

