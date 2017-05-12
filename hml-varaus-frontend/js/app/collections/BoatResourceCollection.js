define(["jquery","backbone", "collections/BaseCollection", "models/BoatResourceModel"],
  function($, Backbone, BaseCollection, BoatResourceModel) {
    var Collection = BaseCollection.extend({
        url: '/api/berth/',
        model: BoatResourceModel,

        initialize: function() {
            this.deferred = this.fetch();
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