define(["jquery","backbone", "collections/BaseCollection", "models/UserModel"],
  function($, Backbone, BaseCollection, UserModel) {
    var Collection = BaseCollection.extend({
        model: UserModel,
        url: '/api/user/',

        initialize: function() {
            this.deferred = this.fetch();
        },

        getByUID: function(id) {
            var user = undefined;
            this.each(function(user2) {
                if(user2.get('uuid') == id)
                    user = user2;
            });
            return user;
        },

        parse: function(response) {
            if (response.last_login) {
                this.currentUser = response;
                return
            }
            var obj = response.results;

            return _.map(obj, function (value, key) {
              return obj[key];
            });
        }
    });

    return Collection;
  });