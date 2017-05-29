define( [
    'App', 
    'backbone',
    'backbone-radio',
    'marionette', 
    'jquery',
    'moment', 
    'text!templates/reservation_filter_view.tmpl'
    ],
    function(App, Backbone, Radio, Marionette, $, moment, template) {
        return Marionette.View.extend({
            tagName: 'div',
            className: 'filter-container',
            template: template,
            filters: {},

            initialize: function() {
                this.mainRadioChannel = Radio.channel('main');
                var filterData = localStorage.getItem('boat_reservation_filters');
                if(filterData) {
                    this.filters = JSON.parse(filterData);
                }

                this.unitCollection = this.options.unitCollection;
            },

            regions: {
            },

            events: {
                'change .filter-input': 'filterInputChanged',
                'click #show-filters': 'showFilters',
                'click #filter-clear': 'clearFilters'
            },

            clearFilters: function(e) {
                this.$('textarea,input,select').val('');
                this.filters = {};
                localStorage.setItem('boat_reservation_filters', JSON.stringify(this.filters));
                this.mainRadioChannel.trigger('reservation-filter-changed');
                $('.ordering-icon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
            },

            showFilters: function(e) {
                if($('#filters').hasClass('in')) {
                    $(e.currentTarget).text('Näytä suodattimet');
                    this.filters.show = false;
                    localStorage.setItem('boat_reservation_filters', JSON.stringify(this.filters));
                }
                else {
                    $(e.currentTarget).text('Piilota suodattimet');
                    this.filters.show = true;
                    localStorage.setItem('boat_reservation_filters', JSON.stringify(this.filters));
                }
            },

            filterInputChanged: function(e) {
                if($(e.currentTarget).hasClass('date')) {
                    var target = $(e.currentTarget).find('input');

                    var filterName = target.attr('name');

                    var value = target.val();

                    value = moment(value, 'D.M.YYYY HH:mm').toISOString();
                }
                else if($(e.currentTarget).hasClass('checkbox')) {
                    var target = $(e.currentTarget);

                    var filterName = target.attr('name');

                    var value = target.prop('checked') ? target.prop('checked') : '';
                }
                else {
                    var target = $(e.currentTarget);

                    var filterName = target.attr('name');

                    var value = target.val();
                }

                if(target.hasClass('float-filter')) {
                     value = Math.round(Number(target.val()) * 100);
                }

                if(value === '' || value === 0 || !value)
                    delete this.filters[filterName];
                else
                    this.filters[filterName] = value;

                localStorage.setItem('boat_reservation_filters', JSON.stringify(this.filters));

                this.mainRadioChannel.trigger('reservation-filter-changed');
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
                    },
                    isoToFinnishDate: function(isoDate) {
                        if(isoDate)
                            return moment(isoDate).format('D.M.YYYY HH:mm');
                        else
                            return '';
                    }
                }

                _.extend(variables, helpers);

                var tmpl = _.template(template);

                this.$el.html(tmpl(variables));

                this.$('#reservation-begin-datepicker').datetimepicker({
                    locale: 'fi'
                }).on('dp.change', function(e) {
                    me.filterInputChanged(e);
                });

                this.$('#reservation-end-datepicker').datetimepicker({
                    locale: 'fi'
                }).on('dp.change', function(e) {
                    me.filterInputChanged(e);

                });
            }
        }
    );
    });