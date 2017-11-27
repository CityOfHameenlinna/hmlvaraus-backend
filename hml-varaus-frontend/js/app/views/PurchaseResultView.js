define( ['App', 'backbone', 'marionette', 'jquery', 'bootbox', 'models/PurchaseModel', 'text!templates/purchase_result_view.tmpl'],
    function(App, Backbone, Marionette, $, bootbox, PurchaseModel, template) {
        return Marionette.View.extend({
        	initialize: function() {
        		this.code = this.options.code;
        	},

        	render: function() {
        		var me = this;
        		this.model = new PurchaseModel();

        		this.model.fetch({data:{code:this.code}})
        		.done(function(data) {
        			me._render();
        		})
        		.fail(function(err) {
                    bootbox.alert('Virhe maksun käsittelyssä! Ota yhteyttä asiakaspalveluun.')
        		});
        	},

            _render: function() {
                var variables = {
                	model: this.model
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                this.model.patch({'report_seen': true, 'code': this.code});
            }
        });
    });