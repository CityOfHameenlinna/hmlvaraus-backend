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

            initialize: function() {
                this.userCollection = window.App.userCollection;
                this.currentUser = this.userCollection.currentUser;
            },

            updateNavBarActive: function(e) {
                this.$('.main-nav-item.active').removeClass('active');
                $(e.currentTarget).addClass('active');
            },

            render: function() {
                var variables = {
                    currentUser: this.currentUser
                }
              	var tmpl = _.template(template, {});
                this.$el.html(tmpl(variables));

                this.$('.main-nav-item.active').removeClass('active');
                if (location.hash == '') {
                  this.$('#nav-main').addClass('active');
                }
                else {
                  this.$('a[href="' + location.hash + '"]').closest('.main-nav-item').addClass('active');
                }
            }
        });
    });
