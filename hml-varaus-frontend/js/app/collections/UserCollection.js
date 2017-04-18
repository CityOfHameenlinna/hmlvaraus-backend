define(["jquery","backbone","models/UserModel"],
  function($, Backbone, UserModel) {
    var Collection = Backbone.Collection.extend({
        model: UserModel,
        url: '/api/user/',
        
        initialize: function() {
            this.deferred = this.fetch();
        },

        parse: function(response) {
            var obj = response.results;

            return _.map(obj, function (value, key) {
              return obj[key];
            });
        },

        getByUID: function(id) {
            var user = undefined;
            this.each(function(user2) {
                if(user2.get('uuid') == id)
                    user = user2;
            });
            return user;
        }
    });

    return Collection;
  });