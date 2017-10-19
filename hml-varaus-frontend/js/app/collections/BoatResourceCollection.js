define([
    "jquery",
    "backbone",
    'backbone-radio',
    "collections/BaseCollection",
    "models/BoatResourceModel"
    ],
  function($, Backbone, Radio, BaseCollection, BoatResourceModel) {
    var Collection = BaseCollection.extend({
        url: '/api/berth/',
        model: BoatResourceModel,
        filterKey: 'boat_resource_filters',
        initialize: function() {
            var me = this;
            this.mainRadioChannel = Radio.channel('main');
            this.mainRadioChannel.on('resource-filter-changed', function() {
                me.fetchFiltered();
            });
            this.deferred = this.fetch();
        },

        getByResourceId: function(id) {
            var needle = undefined;
            this.each(function(item) {
                if(id == item.get('resource').id)
                    needle = item
            });

            return needle;
        },

        parse: function(response) {
            var obj = response.results;
            return _.map(obj, function (value, key) {
              return obj[key];
            });
        }
    });

    return Collection;
  });