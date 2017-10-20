define([
    "jquery",
    "backbone",
    'backbone-radio',
    "collections/BaseCollection",
    "models/UnitModel"],
  function($, Backbone, Radio, BaseCollection, UnitModel) {
    var Collection = BaseCollection.extend({
        url: '/api/unit/',
        model: UnitModel,
        filterKey: 'unit_filters',
        initialize: function() {
            var me = this;
            this.mainRadioChannel = Radio.channel('main');
            this.mainRadioChannel.on('unit-filter-changed', function() {
                me.fetchFiltered();
            });
        },
    });

    return Collection;
  });