define( ['App', 'backbone', 'marionette', 'jquery', 'models/Model', 'text!templates/layout_view.tmpl'],
    function(App, Backbone, Marionette, $, Model, template) {
        return Marionette.View.extend({
        	template: template,
            className: '',
            regions: {
            	headerRegion: '#header',
            	contentRegion: '#content',
            	footerRegion: '#footer'
            },
            events: {
                "click .main-nav-item": "updateNavBarActive"
            },

            updateNavBarActive: function(e) {
                this.$('.main-nav-item.active').removeClass('active');
                $(e.currentTarget).addClass('active');
            },

            render: function() {
            	var tmpl = _.template(template, {});
            	this.$el.html(tmpl);

                this.$('.main-nav-item.active').removeClass('active');
                this.$('a[href="' + location.hash + '"]').closest('.main-nav-item').addClass('active'); 
            }
        });
    });