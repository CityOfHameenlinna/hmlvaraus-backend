define(["jquery","backbone"],
  function($, Backbone) {
    var Collection = Backbone.Collection.extend({
        isFiltered: false,
        fetchAll: function() {
            this.deferred = this.fetch();
            this.isFiltered = false;
        },

        fetchFiltered: function(options) {
            if(!options)
                options = {};

            var filterData = localStorage.getItem(this.filterKey);
            if(filterData) {
                filterData = JSON.parse(filterData);
                if(options.data) {
                    options.data = _.extend(options, filterData);
                }
                else {
                    options.data = filterData;
                }
                options.traditional = true;
            }
            
            this.isFiltered = true;

            return this.fetch(options);
        },
        
        parse: function(response) {
            var obj = response.results;

            return _.map(obj, function (value, key) {
              return obj[key];
            });
        },
    });
    return Collection;
  });