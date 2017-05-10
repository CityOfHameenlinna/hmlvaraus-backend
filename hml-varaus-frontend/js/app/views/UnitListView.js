define( ['App', 'backbone', 'marionette', 'jquery', 'views/UnitItemView'],
    function(App, Backbone, Marionette, $, UnitItemView) {
        return Marionette.CollectionView.extend({
            childView: UnitItemView,
            tagName: 'tbody',
        });
    });