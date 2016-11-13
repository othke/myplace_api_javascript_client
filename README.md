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
var id = '1';
// Result is a Promise
var promise = api.requestResourceById(MyPlaceAPIHelper.IRIS, id, options)
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

### Add Layer to Map

* API provide a MyPlaceMapLayer for display resource from the API on the map (Point, Polyline, Polygon)

```js
// Set the API
var api = new window.MyPlaceAPIHelper(url);

// Cell analysis layer
// request options specify the request methods to use to get data from the resource. there is static methods in MyPlaceMapLayer
var options_cell_analysis = {}
var options_cell_analysis = {apihelper: api, resource: MyPlaceAPIHelper.CELL_ANALYSIS, request:MyPlaceMapLayer.cellAnalysisRequest()}
var layer_cell_analysis = new MyPlaceMapLayer(options_cell_analysis)
mymap.addLayer(layer_cell_analysis)

// Transportation layer
var options_transportation = {}
var options_transportation = {apihelper: api, resource: MyPlaceAPIHelper.TRANSPORTATION, request:MyPlaceMapLayer.resourceRequest(),
     minScale: 17, maxScale:19}
var transportation_layer = new MyPlaceMapLayer(options_transportation)
mymap.addLayer(transportation_layer)

// Shop layer
var options_shop = {}
var options_shop = {apihelper: api, resource: MyPlaceAPIHelper.SHOP, request:MyPlaceMapLayer.resourceRequest(),
     minScale: 18, maxScale:19}
shop_layer = new MyPlaceMapLayer(options_shop)
mymap.addLayer(shop_layer)

// To apply a symbology to the cell analysis
// The array of color is optional. A default color ramp is used if empty
var func = MyPlaceMapLayer.getCellAnalysisGradient("nb_b304", ['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'])
layer_cell_analysis.defineGradientStyle(func)
```