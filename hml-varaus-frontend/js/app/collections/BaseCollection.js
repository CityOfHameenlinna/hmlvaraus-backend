define(["jquery","backbone"],
  function($, Backbone) {
    var Collection = Backbone.Collection.extend({
        parse: function(response) {
            var obj = response.results;

            return _.map(obj, function (value, key) {
              return obj[key];
            });
        }
    });
    return Collection;
  });