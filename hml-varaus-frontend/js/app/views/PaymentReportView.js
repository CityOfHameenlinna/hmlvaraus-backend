define([
    'App',
    'backbone',
    'marionette',
    'jquery',
    'bootbox',
    'moment',
    'models/PurchaseModel',
    'text!templates/payment_report_view.tmpl',
    'text!templates/spinner_view.tmpl'
    ],
    function(App, Backbone, Marionette, $, bootbox, moment, PurchaseModel, template, spinnerTmpl) {
        return Marionette.View.extend({
            filters: {
                start: moment().startOf('day'),
                end: moment().endOf('day'),
                showFailed: false
            },

            events: {
                'change .datepicker-input,.filter-input.checkbox': 'filtersChanged',
                'click #filter-previous-day': 'showPreviousDay',
                'click #filter-next-day': 'showNextDay'
            },

            showPreviousDay: function() {
                var currentDate = this.$('#filter-start-date-datepicker').data("DateTimePicker").date();
                this.filters['start'] = currentDate.subtract(1, 'day').startOf('day');
                this.filters['end'] = moment(currentDate.format()).add(1, 'day').startOf('day');
                this.render();
            },

            showNextDay: function() {
                var currentDate = this.$('#filter-start-date-datepicker').data("DateTimePicker").date();
                this.filters['start'] = currentDate.add(1, 'day').startOf('day');
                this.filters['end'] = moment(currentDate.format()).add(1, 'day').startOf('day');
                this.render();
            },

            initialize: function() {
                this.collection = this.options.paymentCollection;
            },

            render: function() {
                var me = this;
                var tmpl = _.template(spinnerTmpl);

                if(this.$('#payment-report-content-container').length) {
                    this.$('#payment-report-content-container tbody').empty();
                    this.$('#spinner-container').html(tmpl())
                }
                else {
                    this.$el.html(tmpl());
                }

                this.collection.fetch({data:{start: me.filters.start.format(), end: me.filters.end.format(), show_failed: me.filters.showFailed}})
                .done(function(data) {
                    me.collection.add(data);
                    me._render();
                })
                .fail(function(err) {
                    bootbox.alert('Virhe maksun käsittelyssä! Ota yhteyttä asiakaspalveluun.');
                });
            },

            _render: function() {
                var me = this;
                var variables = {
                    collection: this.collection,
                    filters: this.filters
                }

                var tmpl = _.template(template);
                this.$el.html(tmpl(variables));

                this.$('#filter-start-date-datepicker').datetimepicker({
                    locale: 'fi',
                    format: 'DD.MM.YYYY HH:00',
                    defaultDate: this.filters.start,
                    sideBySide: true
                }).on('dp.change', function(e) {
                    me.filtersChanged(e);
                });

                this.$('#filter-end-date-datepicker').datetimepicker({
                    locale: 'fi',
                    format: 'DD.MM.YYYY HH:00',
                    defaultDate: this.filters.end,
                    sideBySide: true
                }).on('dp.change', function(e) {
                    me.filtersChanged(e);
                });
            },

            filtersChanged: function(e) {
                var $target = $(e.currentTarget);
                var name = $target.attr('name');
                if(name == 'start' || name == 'end') {
                    if(!$target.data("DateTimePicker").date())
                        return;
                    this.filters[name] = $target.data("DateTimePicker").date();
                }
                else {
                    name = $target.attr('name');
                    this.filters[name] = $target.prop('checked');
                }
                this.render()
            },
        });
    });
