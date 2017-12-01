define( [
    'App',
    'backbone',
    'marionette',
    'jquery',
    'bootbox',
    'moment',
    'views/BaseView',
    'models/BoatReservationModel',
    'text!templates/renewal_view.tmpl'
    ],
    function(App, Backbone, Marionette, $, bootbox, moment, BaseView, BoatReservationModel, template) {
        return BaseView.extend({
        	initialize: function() {
        		this.code = this.options.code;
        	},

            events: {
                'click #reservation-submit': 'save'
            },

        	render: function() {
        		var me = this;
        		this.model = new BoatReservationModel();

                $.get('/api/renewal/?code=' + this.code)
        		.done(function(data) {
                    me.model.set(data);
        			me._render();
        		})
        		.fail(function(err) {
                    bootbox.alert('Virhe uusinnassa käsittelyssä! Ota yhteyttä asiakaspalveluun.')
        		});
        	},

            _render: function() {
                var newEnd = moment(this.model.getEndTime()).add(1, 'years').format('D.M.YYYY');
                var berthName = this.model.get('berth').resource.name.fi + ' (' + this.model.get('berth').resource.unit.name.fi + ')';

                var variables = {
                	model: this.model,
                    new_end: newEnd,
                    berth_name: berthName
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));
            },

            validateAndReformatData: function(data) {
                if(!this.checkRequired() || !this.checkDateRequired())
                    return false;

                return data;
            },

            save: function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                $target.prop('disabled', true);
                var me = this;
                var bodyJson = this.objectifyForm($('#renew-reservation-form').serializeArray());

                bodyJson = this.validateAndReformatData(bodyJson);

                if(!bodyJson) {
                    $target.prop('disabled', false);
                    return;
                }

                bodyJson['code'] = this.code

                $.ajax({
                    url: '/api/renewal/',
                    method: 'post',
                    data: JSON.stringify(bodyJson),
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done(function(data) {
                    if(data.redirect)
                        window.location = data.redirect;
                    else
                        bootbox.alert('Virhe uusinnassa käsittelyssä! Ota yhteyttä asiakaspalveluun.');
                    $target.prop('disabled', false);
                })
                .fail(function(result) {
                    bootbox.alert('Virhe uusinnassa käsittelyssä! Ota yhteyttä asiakaspalveluun.');
                    $target.prop('disabled', false);
                });
            },

        });
    });