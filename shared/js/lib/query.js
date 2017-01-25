var Facility = require('cloud/models/facility');
var data = require('./data');

var findByFilter = function(params) {
  var deferred = $.Deferred();
  var result = data;
  var offset = result[0];
  var facilities = result.slice(1);
  var category = params.filter.categories[0];

  var filteredFacilities = [];

  facilities.forEach(function(data) {
    if(hasCategory(data,category)) {
      filteredFacilities.push(convertFacility(data));
    }
  });

  deferred.resolve({
    data: filteredFacilities,
    offset: offset
  });

  return deferred.promise();
};

var hasCategory = function(data, category) {
  var result = data.services.find(function(service) {
    return service.category === category;
  });
  return !!result;
};

var convertFacility = function(data) {
  var facility = new Facility(data);
  facility.attributes.services = data.services;
  return facility;
};

var findById = function(id) {
  var deferred = $.Deferred();
  var result = data;

  function isElem(elem) {
    return elem.objectId == id;
  }

  var found = result.find(isElem);
  var facility = convertFacility(found);
  deferred.resolve(facility);

  return deferred.promise();
};

module.exports = {
  findByFilter: findByFilter,
  findById: findById
};

