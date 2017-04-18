define( ['App', 'backbone', 'marionette', 'jquery', 'text!templates/boat_resource_list_view.tmpl', 'views/BoatResourceItemView'],
    function(App, Backbone, Marionette, $, template, BoatResourceItemView) {
        return Marionette.CollectionView.extend({
            childView: BoatResourceItemView,
            tagName: 'tbody',
        });
    });