import MyPlaceAPIHelper from './MyPlaceAPIHelper.js';
import MyPlaceMapLayer from './MyPlaceMapLayer.js';

// Set object
window.url = 'http://138.68.76.116:5000/api/v1/';
window.MyPlaceAPIHelper = MyPlaceAPIHelper;
window.MyPlaceMapLayer = MyPlaceMapLayer;
window.MyPlaceMapLayerSymbology = MyPlaceMapLayer;

// Create the map
window.mymap = L.map('map').setView([48.85, 2.35], 13);
var tile_url = "http://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
//var tile_url = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

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
var clearStyle = {
    fillColor: undefined,
    weight: 0,
    opacity: 0,
    color: undefined,
    fillOpacity: 0
}
var options_cell_analysis = { apihelper: api, resource: MyPlaceAPIHelper.CELL_ANALYSIS, request: MyPlaceMapLayer.cellAnalysisRequest(), style: clearStyle }
window.layer_cell_analysis = new MyPlaceMapLayer(options_cell_analysis)
mymap.addLayer(window.layer_cell_analysis)

// Transportation layer
var options_transportation = {}
var options_transportation = {
    apihelper: api, resource: MyPlaceAPIHelper.TRANSPORTATION, request: MyPlaceMapLayer.resourceRequest(),
    minScale: 17, maxScale: 19
}
window.transportation_layer = new MyPlaceMapLayer(options_transportation)
mymap.addLayer(window.transportation_layer)

// Shop layer
var options_shop = {}
var options_shop = {
    apihelper: api, resource: MyPlaceAPIHelper.SHOP, request: MyPlaceMapLayer.resourceRequest(),
    minScale: 18, maxScale: 19
}
window.shop_layer = new MyPlaceMapLayer(options_shop)
mymap.addLayer(window.shop_layer)


// Change shop layer
var selectShop = document.getElementById('shop-id');
selectShop.onchange = function (e) {
    var shop = e.target.value
    var func = MyPlaceMapLayer.getCellAnalysisGradient(shop);
    window.layer_cell_analysis.defineGradientStyle(func)
};


// Loader
$("#loading").hide()
addEventListener("loadingStart", function (e) { console.log("start"); $("#loading").show() })
addEventListener("loadingEnd", function (e) { console.log("end"); $("#loading").hide() })

// tiles


window.wgs84ToTms = function (lon, lat, zoom) {
    var lat_rad = lat * (Math.PI / 180);
    var n = Math.pow(2.0, zoom);
    var xtile = parseInt((lon + 180.0) / 360.0 * n);
    var ytile = parseInt((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n)
    return [xtile, ytile, zoom]
}

window.extentToTms = function(xmin, ymin, xmax, ymax, zoom){
    var tiles = [];
    var topLeft = wgs84ToTms(xmin, ymax, zoom);
    var bottomRight = wgs84ToTms(xmax, ymax, zoom);
    for(var xTile = topLeft[0]; xTile <= bottomRight[0]; xTile++){
        for(var yTile = topLeft[1]; yTile <= bottomRight[1]; yTile++){
            tiles.push({x: xTile, y:yTile, z:zoom})
        }
    }
    return tiles
}