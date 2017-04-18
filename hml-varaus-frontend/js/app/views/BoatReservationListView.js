define( ['App', 'backbone', 'marionette', 'jquery', 'views/BoatReservationItemView', 'text!templates/boat_reservation_list_view.tmpl'],
    function(App, Backbone, Marionette, $, BoatReservationItemView, template) {
        return Marionette.CollectionView.extend({
        	tagName: 'tbody',
            childView: BoatReservationItemView
        });
    });