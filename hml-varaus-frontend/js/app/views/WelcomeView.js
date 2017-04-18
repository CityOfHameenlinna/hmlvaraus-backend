define( ['App', 'backbone', 'marionette', 'jquery', 'models/Model', 'text!templates/welcome_view.tmpl'],
    function(App, Backbone, Marionette, $, Model, template) {
        return Marionette.View.extend({
            render: function() {
            	var tmpl = _.template(template, {});
            	this.$el.html(tmpl);
            }
        });
    });