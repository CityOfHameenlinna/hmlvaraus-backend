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
            this.deferred = this.fetch();

            this.mainRadioChannel.on('resource-filter-changed', function() {
                me.fetchFiltered();
            });
        },

        getByResourceId: function(id) {
            var needle = undefined; 
            this.each(function(item) {
                if(id == item.get('resource').id)
                    needle = item
            });

            return needle;
        }
    });

    return Collection;
  });