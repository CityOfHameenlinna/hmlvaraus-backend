define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'views/BaseView',
    'text!templates/unit_edit_view.tmpl',
    'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyAdf1cqzsZLVigUFbrgbqDLBfx_1pexr0I'],
    function(App, Backbone, Radio, bootbox, Marionette, $, BaseView, template) {
        return Marionette.View.extend({
            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
                this.unitCollection = this.options.unitCollection
            },

            events: {
                'click #unit-submit': 'saveUnit',
                'click #unit-delete': 'deleteUnit',
                'change .required': 'checkRequired'
            },

            ui: {
                mapContainer: "#google-map"
            },

            render: function() {
                var variables = {
                    unit: this.model,
                }
                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                this.addGoogleMap();
            },

            addGoogleMap: function() {
                var me = this;
                var hml = {
                    lng: 24.4590,
                    lat: 60.9929
                }
                var modelLocation = this.model.getLocation();

                this.map = new google.maps.Map(this.$(this.ui.mapContainer).get(0), {
                  zoom: 12,
                  center: modelLocation ? modelLocation : hml
                });

                google.maps.event.addListener(this.map, 'click', function(event) {
                    me.changeUnitLocation(event.latLng);
                });

                if(modelLocation) {
                    this.unitMarker = new google.maps.Marker({
                      position: modelLocation,
                      map: this.map
                    });
                }
            },

            changeUnitLocation: function(location) {
                location = location.toJSON();
                if(this.unitMarker) {
                    this.unitMarker.setPosition(location);
                }
                else {
                    this.unitMarker = new google.maps.Marker({
                      position: location,
                      map: this.map
                    });
                }
                geocoder = new google.maps.Geocoder();

                geocoder.geocode(
                {
                    latLng: new google.maps.LatLng(location.lat, location.lng)
                }, 
                function(responses) {
                    if (responses && responses.length > 0) {
                        var streetAddress = responses[0].formatted_address.substr(0, responses[0].formatted_address.indexOf(',')); 
                        var zip = responses[0].formatted_address.match(/\d\d\d\d\d/)[0];

                        if(streetAddress && zip) {
                            this.$('#unit-address').val(streetAddress);
                            this.$('#unit-zip').val(zip);
                        }
                    }
                });
                
                this.$('#unit-location').val(location.lng + ' ' + location.lat);
            },

            deleteUnit: function(e) {
                var me = this;
                e.preventDefault();

                bootbox.confirm({
                    message: "Olet poistamassa kohdetta. Kaikki kohteen venepaikat ja niiden varaukset poistuvat samalla. Oletko varma?",
                    buttons: {
                        confirm: {
                            label: 'Poista',
                            className: 'btn-danger'
                        },
                        cancel: {
                            label: 'Peruuta',
                            className: 'btn-default'
                        }
                    },
                    callback: function (result) {
                        if(result) {
                            me.model.destroy()
                            .done(function() {
                                me.mainRadioChannel.trigger('unit-changed');
                            })
                            .fail(function(result) {
                                me.showRequestErrors(result.responseJSON);
                            });
                        }
                    }
                });
            },

            saveUnit: function(e) {
                e.preventDefault();
                var me = this;
                
                var data = this.objectifyForm($('#edit-unit-form').serializeArray());
                data = this.validateAndReformatData(data);

                if(!data)
                    return;

                this.model.set('name', data.name);
                this.model.set('description', data.description);
                this.model.set('street_address', data.street_address);
                this.model.set('phone', data.phone);
                this.model.set('email', data.email);
                this.model.set('address_zip', data.address_zip);

                if(this.unitMarker) {
                    var location = {
                        coordinates: [this.unitMarker.getPosition().toJSON().lng, this.unitMarker.getPosition().toJSON().lat],
                        type: 'Point'
                    }
                    this.model.set('location', location);
                }

                this.model.save()
                .done(function() {
                    me.mainRadioChannel.trigger('unit-changed');
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                });
            },

            validateAndReformatData: function(data) {
                if(!this.checkRequired())
                    return false;

                data.street_address = {fi: data.street_address};
                data.name = {fi: data.name};
                data.description = {fi:data.description};

                return data;
            },

            objectifyForm: function(formArray) {
                var returnArray = {};
                for (var i = 0; i < formArray.length; i++){
                    if(formArray[i]['value'] != '')
                        returnArray[formArray[i]['name']] = formArray[i]['value'];
                }
                return returnArray;
            }        
        });
    });