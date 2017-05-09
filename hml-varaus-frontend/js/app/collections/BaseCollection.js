define(["jquery","backbone"],
  function($, Backbone) {
    var Collection = Backbone.Collection.extend({
        parse: function(response) {
            var obj = response.results;

            return _.map(obj, function (value, key) {
              return obj[key];
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