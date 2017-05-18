define( ['App',
    'backbone',
    'backbone-radio',
    'bootbox',
    'marionette',
    'jquery',
    'text!templates/error.tmpl'],
    function(App, Backbone, Radio, bootbox, Marionette, $, error_tmpl) {
        return Marionette.View.extend({
            checkRequired: function(e) {
                var isValid = true;
                if(e) {
                    if($(e.currentTarget).val() == '') {
                        $(e.currentTarget).addClass('required-error');
                        $(e.currentTarget).next('span.error').find('p').text('Tämä kenttä vaaditaan');
                        isValid = false;
                    }
                    else {
                        $(e.currentTarget).removeClass('required-error');
                        if(!$(this).hasClass('validation-error'))
                            $(e.currentTarget).next('span.error').find('p').text('');
                    }
                }
                else {
                    $('input.required, textarea.required').each(function() {
                        if($(this).val() == '') {
                            $(this).addClass('required-error');
                            $(this).next('span.error').find('p').text('Tämä kenttä vaaditaan');
                            isValid = false;
                        }
                        else {
                            $(this).removeClass('required-error');
                            if(!$(this).hasClass('validation-error'))
                                $(this).next('span.error').find('p').text('');
                        }
                    });
                }

                return isValid;
            },

            checkDateRequired: function(e) {
                var isValid = true;

                if(e) {
                    target = $(e.currentTarget);
                    input = target.find('input');
                    if(input.val() == '') {
                        input.addClass('required-error');
                        target.next('span.error').find('p').text('Tämä kenttä vaaditaan');
                        isValid = false;
                    }
                    else {
                        input.removeClass('required-error');
                        target.next('span.error').find('p').text('');
                    }
                }
                else {
                    $('div.required').each(function() {
                        if($(this).val() == '') {
                            $(this).find('input').addClass('required-error');
                            $(this).next('span.error').find('p').text('Tämä kenttä vaaditaan');
                            isValid = false;
                        }
                        else {
                            $(this).find('input').removeClass('required-error');
                            $(this).next('span.error').find('p').text('');
                        }
                    });
                }

                return isValid;
            },

            showRequestErrors: function(errors) {
                var errorArray = [];
                for (var key in errors) {
                    if (errors.hasOwnProperty(key)) {
                        var field = errors[key];
                        for (var key2 in field) {
                            if (field.hasOwnProperty(key2)) {
                                var object = {};
                                object.obj = key;
                                object.field = key2;
                                object.err = '';
                                if(Array.isArray(field[key2])) {
                                    field[key2].forEach(function(err) {
                                        object.err += err + ' ';
                                    });
                                }
                                else {
                                    object.err += field[key2] + ' ';
                                }

                                errorArray.push(object);
                            }
                        }
                    }
                }
                var variables = {
                    errorArray: errorArray
                }
                var tmpl = _.template(error_tmpl);
                var html = tmpl(variables);

                bootbox.alert(html);
            },

            objectifyForm: function(formArray) {
                var returnArray = {};
                for (var i = 0; i < formArray.length; i++){
                    if(formArray[i]['value'] != '')
                        returnArray[formArray[i]['name']] = formArray[i]['value'];
                }
                return returnArray;
            }
        });
    });