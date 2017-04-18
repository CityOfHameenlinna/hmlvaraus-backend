require.config({
    baseUrl:"./js/app",

    paths:{
        "jquery":"../libs/jquery",
        "underscore":"../libs/underscore",
        "backbone":"../libs/backbone",
        "backbone-radio":"../libs/backbone.radio",
        "marionette":"../libs/backbone.marionette",
        "json2":"../libs/json2",
        "bootstrap":"../libs/plugins/bootstrap",
        "text":"../libs/plugins/text",
        "moment":"../libs/moment",
        "bootstrap-datepicker":"../libs/plugins/bootstrap-datetimepicker"
    },

    shim:{

        "moment": {
            "exports": "moment"
        },

        "underscore": {
            "exports": "_"
        },

        "bootstrap":["jquery"],
        "backbone":{
            "deps":["underscore", "jquery"],
            "exports":"Backbone"
        },
        "marionette":{
            "deps":["underscore", "backbone", "jquery"],
            "exports":"Marionette"
        },

    }
});

require(['App',], function(App) {
        App.initialize();
});