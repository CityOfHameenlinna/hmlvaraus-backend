define(["jquery","backbone"],
  function($, Backbone) {
    var Collection = Backbone.Collection.extend({
        isFiltered: false,

        fetchFiltered: function(options, page, reset, remove) {
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

            if (page && remove) {
                options.data.page = page;
                options.remove = remove;
            }
            if (reset) {
                this.reset();
            }

            return this.fetch(options);
        },

        fetchPaginated: function(page, reset, remove) {
            var me = this;
            if (reset) {
                this.reset();
            }
            this.fetch({
                data: {page: page, show_cancelled: true},
                remove: remove,
                success: function(collection, response) {
                    if (response.next) {
                        me.page = response.next - 1;
                        me.nextPage = response.next;
                    }
                    if (response.previous) {
                        me.page = response.previous + 1;
                        me.previousPage = response.previous;
                    }
                }
            });
        },

        parse: function(response) {
            // console.log('parse', response);
            var obj = response.results;

            return _.map(obj, function (value, key) {
              return obj[key];
            });
        },
    });
    return Collection;
  });
