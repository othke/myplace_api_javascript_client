import MyPlaceAPIHelper from './MyPlaceAPIHelper.js';
import MyPlaceMapLayer from './MyPlaceMapLayer.js';

// Set object
window.url = 'http://localhost:5000/api/v1/';
window.MyPlaceAPIHelper = MyPlaceAPIHelper;
window.MyPlaceMapLayer = MyPlaceMapLayer;
window.MyPlaceMapLayerSymbology = MyPlaceMapLayer;

// Create the map
window.mymap = L.map('mapid').setView([48.85, 2.35], 13);
var tile_url = "http://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
var tile_url = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

L.tileLayer(tile_url, {
    maxZoom: 18,
    id: 'mapbox.streets'
}).addTo(mymap);

// Display coordinates
mymap.on('click', function (e) {
    console.log(e.latlng.lng, e.latlng.lat);
})


// Create api
window.api = new window.MyPlaceAPIHelper(window.url);

// Cell analysis layer
var options_cell_analysis = {}
var options_cell_analysis = {apihelper: api, resource: MyPlaceAPIHelper.CELL_ANALYSIS, request:MyPlaceMapLayer.cellAnalysisRequest()}
window.layer_cell_analysis = new MyPlaceMapLayer(options_cell_analysis)
mymap.addLayer(window.layer_cell_analysis)

// Transportation layer
var options_transportation = {}
var options_transportation = {apihelper: api, resource: MyPlaceAPIHelper.TRANSPORTATION, request:MyPlaceMapLayer.resourceRequest(),
     minScale: 16, maxScale:19}
window.transportation_layer = new MyPlaceMapLayer(options_transportation)
// mymap.addLayer(window.transportation_layer)

// Shop layer
var options_shop = {}
var options_shop = {apihelper: api, resource: MyPlaceAPIHelper.SHOP, request:MyPlaceMapLayer.resourceRequest(),
     minScale: 18, maxScale:19}
window.shop_layer = new MyPlaceMapLayer(options_shop)
mymap.addLayer(window.shop_layer)