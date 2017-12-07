define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'moment',
    'bootstrap-datepicker',
    'views/BaseView',
    'collections/BoatResourceCollection',
    'text!templates/boat_new_reservation_view.tmpl',
    'text!templates/boat_new_reservation_view_noauth.tmpl'],
    function(App, Backbone, Radio, bootbox, Marionette, $, moment, datepicker, BaseView, BoatResourceCollection, template, templateNoAuth) {
        return BaseView.extend({
            lastPollCode: undefined,
            initialize: function() {
                this.boatReservationCollection = this.options.boatReservationCollection;
                this.boatResourceCollection = this.options.boatResourceCollection;
                this.unitCollection = this.options.unitCollection;
                this.userCollection = this.options.userCollection;
                this.mainRadioChannel = Radio.channel('main');
            },

            events: {
                'click #reservation-submit': 'save',
                'change input.required,textarea.required': 'checkRequired',
                'click .main-nav-item a': 'confirmNavigate'
            },

            confirmNavigate: function(e)  {
                e.preventDefault();
                bootbox.confirm({
                    message: "Olet poistumassa kesken varausprosessin. Tallentamattomat tiedot menetetään. Poistutaanko?",
                    buttons: {
                        confirm: {
                            label: 'Poistu',
                            className: 'btn-danger'
                        },
                        cancel: {
                            label: 'Peruuta',
                            className: 'btn-default'
                        }
                    },
                    callback: function (result) {
                        if(result) {
                            var href = $(e.currentTarget).prop('href');
                            window.App.router.navigate(href.substring(href.indexOf('#')), {trigger: true})
                        }
                    }
                });
            },

            render: function() {
                var me = this;

                var filteredCollection = this.boatResourceCollection.filter(function(resource) {
                    return !resource.isDisabled();
                });

                var resources = new BoatResourceCollection(filteredCollection);

                var variables = {
                    boat_reservation_collection: this.boatReservationCollection,
                    boat_resource_collection: resources,
                    unit_collection: this.unitCollection,
                    resource_id: this.options.resourceId,
                    now_date: moment().format('D.M.YYYY'),
                    end_date: moment().add(1, 'years').format('D.M.YYYY')
                }

                var helpers = {
                    getUnitName: function(unit_id) {
                        var unit = this.unit_collection.get(unit_id);
                        if(unit)
                            return unit.getName();
                        else
                            return '';
                    }
                }

                _.extend(variables, helpers);

                if(this.userCollection.currentUser)
                    var tmpl = _.template(template);
                else
                    var tmpl = _.template(templateNoAuth);

                this.$el.html(tmpl(variables));

                this.$('#reservation-begin-datepicker').datetimepicker({
                    locale: 'fi'
                }).on('dp.change', function(e) {
                    me.checkDateRequired(e);
                    me.checkBeginBeforeEnd();
                    me.setEndDate(e);
                });

                this.$('#reservation-end-datepicker').datetimepicker({
                    locale: 'fi'
                }).on('dp.change', function(e) {
                    me.checkDateRequired(e);
                    me.checkBeginBeforeEnd();
                });

                if(!this.userCollection.currentUser) {
                    var countDownTime = moment().add(15, 'minutes');
                    this.intervalCounter = 0;
                    this.pollCounter = 0;
                    this.counterInterval = setInterval(function() {
                        if(me.intervalCounter % 60 === 0 || me.intervalCounter === 0) {
                            $.ajax({
                                url: '/api/purchase/',
                                method: 'patch',
                                data: JSON.stringify({resource: me.options.resourceId}),
                                dataType: 'json',
                                contentType: 'application/json'
                            })
                            .done(function(data) {
                                me.lastPollCode = data.code;
                                me.pollCounter++;
                            })
                            .fail(function(err) {
                                if(me.pollCounter === 0) {
                                    bootbox.alert('Joku on jo varaamassa valitsemaasi venepaikkaa. Siirrytään venepaikkalistaukseen...')
                                    clearInterval(this.counterInterval);
                                    window.onbeforeunload = null;
                                    $('.main-nav-item a').off('click.navigation');
                                    me.$('#reservation-countdown-wrapper').text('Varaus peruutettu. Siirrytään venepaikkalistaukseen...');
                                    setTimeout(function() {
                                        window.App.router.navigate('#boat-resources', {trigger: true});
                                        bootbox.hideAll()
                                    }, 5000);
                                }
                                me.pollCounter++;
                            });
                        }
                        me.intervalCounter++;
                        var now = moment();
                        var distance = countDownTime.diff(now);
                        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.round((distance % (1000 * 60)) / 1000);
                        me.$('#reservation-countdown').text(minutes + 'm ' + seconds + 's ');

                        if (distance < 0) {
                            clearInterval(me.counterInterval);
                            me.$('#reservation-countdown-wrapper').text('Varaus peruutettu. Siirrytään venepaikkalistaukseen...');
                            setTimeout(function() {
                                window.App.router.navigate('#boat-resources', {trigger: true});
                            }, 3000);
                        }
                    }, 1000);

                    window.onbeforeunload = function (e) {
                      var message = "Olet poistumassa kesken varausprosessin. Tallentamattomat tiedot menetetään. Poistutaanko?",
                      e = e || window.event;
                      if (e) {
                        e.returnValue = message;
                      }
                      return message;
                    };
                    $('.main-nav-item a').off('click.navigation').on('click.navigation', function(e) {
                        me.confirmNavigate(e);
                    });
                }
            },

            setEndDate: function(e) {
                var newDate = e.date.add(1, 'y').format('D.M.YYYY HH:mm');
                $('#reservation-end-datepicker').find('input').val(newDate);
            },

            checkBeginBeforeEnd: function(e) {
                var beginPicker = $('#reservation-begin-datepicker');
                var endPicker = $('#reservation-end-datepicker');

                var beginString = beginPicker.find('input').val();
                var endString = endPicker.find('input').val();

                var beginTime = moment(beginString, 'D.M.YYYY HH:mm');
                var endTime = moment(endString, 'D.M.YYYY HH:mm');
                if(!beginTime || !endTime)
                    return false;

                if(endTime.isBefore(beginTime)) {
                    beginPicker.find('input').addClass('validation-error');
                    endPicker.find('input').addClass('validation-error');
                    beginPicker.next('span.error').find('p').text('Alkupäivämäärän pitää olla ennen loppupäivämäärää.');
                }
                else {
                    beginPicker.find('input').removeClass('validation-error');
                    endPicker.find('input').removeClass('validation-error');
                    beginPicker.next('span.error').find('p').text('');
                }
            },

            validateAndReformatData: function(data) {
                if(!this.checkRequired() || !this.checkDateRequired())
                    return false;

                data.begin = moment(data.begin, 'D.M.YYYY HH:mm').toISOString();
                data.end = moment(data.end, 'D.M.YYYY HH:mm').toISOString();
                data.state = 'confirmed';
                data.user = {
                    id: data.user
                }
                data.reservable = false;
                var reserverSSN = data.reserver_ssn;
                delete data.reserver_ssn;

                var berth = undefined;
                var me = this;
                if(!data.resource)
                    data.resource = this.options.resourceId;
                this.boatResourceCollection.forEach(function(resource) {
                    if (resource.get('resource').id == data.resource) {
                        berth = resource.attributes;
                    }
                });

                hmlreservationData = {
                    berth: berth,
                    reservation: data,
                    is_paid: false,
                    code: me.lastPollCode
                }

                return hmlreservationData;
            },

            save: function(e) {
                window.onbeforeunload = null;
                var $target = $(e.currentTarget);
                $target.prop('disabled', true);
                var me = this;
                e.preventDefault();
                var bodyJson = this.objectifyForm($('#new-reservation-form').serializeArray());

                bodyJson = this.validateAndReformatData(bodyJson);

                if(!bodyJson) {
                    $target.prop('disabled', false);
                    return;
                }

                $.ajax({
                    url: this.userCollection.currentUser ? '/api/hml_reservation/' : '/api/purchase/',
                    method: 'post',
                    data: JSON.stringify(bodyJson),
                    dataType: 'json',
                    contentType: 'application/json'
                })
                .done(function(data) {
                    if(data.redirect)
                        window.location = data.redirect;
                    else
                        me.mainRadioChannel.trigger('reservation-changed', data.id);
                    $target.prop('disabled', false);
                })
                .fail(function(result) {
                    me.showRequestErrors(result.responseJSON);
                    $target.prop('disabled', false);
                });
            },
            onDestroy: function() {
                clearInterval(this.counterInterval);
                window.onbeforeunload = null;
                $('.main-nav-item a').off('click.navigation');
            }
        });
    });
