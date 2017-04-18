define(["jquery","backbone","models/BoatResourceModel"],
  function($, Backbone, BoatResourceModel) {
    var Collection = Backbone.Collection.extend({
        url: '/api/resource/',
        model: BoatResourceModel,

        initialize: function() {
            this.deferred = this.fetch();
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