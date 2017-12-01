define( [
    'App',
    'backbone',
    'backbone-radio',
    'marionette',
    'jquery',
    'moment',
    'text!templates/boat_manage_resource_filter_view.tmpl'
    ],
    function(App, Backbone, Radio, Marionette, $, moment, template) {
        return Marionette.View.extend({
            tagName: 'div',
            className: 'filter-container-map',
            template: template,
            filters: {},

            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
                var filterData = localStorage.getItem('boat_resource_filters');
                if(filterData) {
                    this.filters = JSON.parse(filterData);
                }

                this.unitCollection = this.options.unitCollection;
                localStorage.setItem('boat_resource_filters', JSON.stringify(this.filters));
            },

            regions: {
            },

            events: {
                'change .filter-input': 'filterInputChanged',
                'click #filter-clear': 'clearFilters',
            },

            clearFilters: function(e) {
                this.$('textarea,input,select').val('');
                this.$('input.checkbox').prop('checked', false);
                this.filters = {};
                localStorage.setItem('boat_resource_filters', JSON.stringify(this.filters));
                this.mainRadioChannel.trigger('resource-filter-changed', this.filters);
                $('.ordering-icon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
            },

            filterInputChanged: function(e) {
                var target = $(e.currentTarget);
                var filterName = target.attr('name');
                var value = target.val();

                if(target.hasClass('dimension-filter')) {
                     value = Math.round(Number(target.val()) * 100);
                }

                if(value === '' || value === 0  || !value)
                    delete this.filters[filterName];
                else
                    this.filters[filterName] = value;

                localStorage.setItem('boat_resource_filters', JSON.stringify(this.filters));

                this.mainRadioChannel.trigger('resource-filter-changed', this.filters);
            },

            render: function() {
                var me = this;
                var variables = {
                    filters: this.filters,
                    unit_collection: this.unitCollection
                }

                var helpers = {
                    cmToMeters: function(cm) {
                        if(!cm)
                            return '';
                        var meters = Number(cm) / 100;
                        meters = meters.toFixed(2);
                        return meters;
                    }
                }

                _.extend(variables, helpers);

                var tmpl = _.template(template);

                this.$el.html(tmpl(variables));
            }
        }
    );
    });