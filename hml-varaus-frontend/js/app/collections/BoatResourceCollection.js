define(["jquery","backbone", "collections/BaseCollection", "models/BoatResourceModel"],
  function($, Backbone, BaseCollection, BoatResourceModel) {
    var Collection = BaseCollection.extend({
        url: '/api/berth/',
        model: BoatResourceModel,

        initialize: function() {
            this.deferred = this.fetch();
        },

        parse: function(response) {
            var obj = response.results;

            return _.map(obj, function (value, key) {
                value.resource.type = value.resource.resource_type;
                delete value.resource.type;
                Object.assign(value, value.resource);
                delete value.resource;
                return value;
            });
        }
    });

    return Collection;
  });