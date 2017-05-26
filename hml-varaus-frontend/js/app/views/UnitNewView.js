define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'views/BaseView',
    'text!templates/unit_new_view.tmpl',
    'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyAdf1cqzsZLVigUFbrgbqDLBfx_1pexr0I'
    ],
    function(App, Backbone, Radio, bootbox, Marionette, $, BaseView, template) {
        return BaseView.extend({
            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
            },

            ui: {
                mapContainer: "#google-map"
            },

            render: function() {
                var variables = {
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

                this.map = new google.maps.Map(this.$(this.ui.mapContainer).get(0), {
                  zoom: 12,
                  center: hml
                });

                google.maps.event.addListener(this.map, 'click', function(event) {
                    me.changeUnitLocation(event.latLng);
                });

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

            events: {
                "click #unit-submit": "save",
                'change .required': 'checkRequired'
            },

            validateAndReformatData: function(data) {
                if(!this.checkRequired())
                    return false;
                
                data.street_address = {fi: data.street_address}
                data.name = {fi: data.name}
                data.description = {fi:data.description};

                if(this.unitMarker) {
                    data.location = {
                        coordinates: [this.unitMarker.getPosition().toJSON().lng, this.unitMarker.getPosition().toJSON().lat],
                        type: 'Point'
                    }
                }

                return data;
            },

            save: function(e) {
                e.preventDefault();
                var me = this;
                var bodyJson = this.objectifyForm($('#new-unit-form').serializeArray());

                bodyJson = this.validateAndReformatData(bodyJson);
                if(!bodyJson)
                    return;
                $.ajax({
                    url: '/api/unit/',
                    method: 'post',
                    data: JSON.stringify(bodyJson),
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done(function(data) {
                    me.mainRadioChannel.trigger('unit-changed', data.id);
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                });
            },
        });
    });