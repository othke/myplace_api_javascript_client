# MyPlaceAPI JavaScript client

JavaScript client API for use MyPlaceAPI.

## Installation

* Install  [node](https://nodejs.org)
* run `npm install`
* use webpack to build browser compatible js file `webpack`

## Samples

### Helpers methods
*  API provide all helpers methods for prepare request and perform request to MyPlaceAPI

```js
// Create an API instance
var api = new MyPlaceAPIHelper('http://localhost/api/v1');

/**
* Get IRIS by ID
*/
var options = {};
// Specify options. Returned fields and format
options.fields = ['p12_pop1824', 'p12_pop2539', 'p12_pop4054', 'geometry']
options.format = MyPlaceAPIHelper.GEOJSON
// Result is a Promise
var promise = api.requestResourceById(MyPlaceAPIHelper.IRIS, '1', options)
promise.then(function(response){
    console.log(response);
}).catch(function(error){
    console.log(error);
})

/** 
* Get SHOP by type and near coordinates 
*/
// First: prepare argument
var options = {};
options.format = MyPlaceAPIHelper.GEOJSON
var nearArg = api.getGeoNearSpatialArg(2.34524, 48.85184)
var typeShopArg = {"code_shop": "nb_b304"}
//Use the AND helpers
var arg = api.getAndArg(nearArg, typeShopArg)
options.where = arg
// Second: perform request
var promise = api.requestResources(MyPlaceAPIHelper.SHOP, options)
promise.then(function(response){
    console.log(response);
}).catch(function(error){
    console.log(error);
})
```

### Shortcuts methods

* API provide all shortcuts methods for perform request to MyPlaceAPI

```js

/** 
* Get SHOP by type and near coordinates 
*/
// Create an API instance
var api = new MyPlaceAPIHelper('http://localhost/api/v1');
var promise = api.requestNearShopByType(2.34524, 48.85184, 'nb_b304')
promise.then(function(response){
    console.log(response);
}).catch(function(error){
    console.log(error);
})
```