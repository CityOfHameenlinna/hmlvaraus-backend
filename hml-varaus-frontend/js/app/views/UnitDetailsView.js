define( ['App',
    'backbone',
    'marionette',
    'jquery',
    'text!templates/unit_details_view.tmpl',
    'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyAdf1cqzsZLVigUFbrgbqDLBfx_1pexr0I'
    ],
    function(App, Backbone, Marionette, $, template) {
        return Marionette.View.extend({
            initialize: function() {
            },
            events: {
                'click #unit-edit': 'editUnit'
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
                var modelLocation = this.model.getLocation();

                if(modelLocation) {
                    this.map = new google.maps.Map(this.$(this.ui.mapContainer).get(0), {
                      zoom: 12,
                      center: modelLocation
                    });

                    this.unitMarker = new google.maps.Marker({
                      position: modelLocation,
                      map: this.map
                    });
                }
            },
            editUnit: function() {
                window.App.router.navigate('unit-edit/' + this.model.getId(), {trigger: true});
            }
        });
    });