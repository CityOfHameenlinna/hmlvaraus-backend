define([
    "jquery",
    "backbone",
    'backbone-radio',
    "collections/BaseCollection",
    "models/PurchaseModel"],
  function($, Backbone, Radio, BaseCollection, PurchaseModel) {
    var Collection = BaseCollection.extend({
        url: '/api/purchase/',
        model: PurchaseModel,
        initialize: function() {

        },

        getSumFinnish: function() {
            var sum = 0;
            this.each(function(payment) {
                if(!payment.isSuccess())
                    return;
                sum += Number(payment.getPrice());
            });
            return sum.toFixed(2).replace('.', ',');
        }
    });

    return Collection;
  });
