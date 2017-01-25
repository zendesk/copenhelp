require('./lib/shim_bind');
var Handlebars = require('hbsfy/runtime');

Handlebars.registerPartial('filterCategories',    require('./templates/_filter_categories.hbs'));
Handlebars.registerPartial('openHours',           require('./templates/_open_hours.hbs'));
Handlebars.registerPartial('queryRepresentation', require('./templates/_query_representation.hbs'));

if ( typeof ga === 'undefined' ) {
  window.ga = function(){};
}

$(function() {
  window.FastClick.attach(document.body);
  require('./lib/boot');
  Parse.serverURL = 'http://api.link-sf.com';
  Parse.initialize(config.parseAppId, config.parseJsKey);
  require('./routers/router').instance();
  Backbone.history.start();
});
