define(["jquery","backbone","models/UserModel"],
  function($, Backbone, UserModel) {
    var Collection = Backbone.Collection.extend({
        model: UserModel,
        url: "localhost:8000/v1/"
    });

    return Collection;
  });