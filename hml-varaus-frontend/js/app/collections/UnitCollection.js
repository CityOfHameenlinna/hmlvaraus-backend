define(["jquery","backbone", "collections/BaseCollection", "models/UnitModel"],
  function($, Backbone, BaseCollection, UnitModel) {
    var Collection = BaseCollection.extend({
        url: '/api/unit/',
        model: UnitModel,

        initialize: function() {
            this.deferred = this.fetch();
        }
    });

    return Collection;
  });