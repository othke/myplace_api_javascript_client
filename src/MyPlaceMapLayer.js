import Axios from 'axios';
import L from 'leaflet';
import MyPlaceAPIHelper from './MyPlaceAPIHelper.js';

/** Class representing a MyPlaceMapLayer. 
 *  This class has methods for build Leaflet layer
 * 
 *  MyPlaceMapLayer is built ontop of Leaflet
*/
class MyPlaceMapLayer extends L.GeoJSON {

    /**
     * Constructor
     * @param {Object} uOptions - custom layer options
     * @param {string} uOptions.apihelper - api helper
     * @param {string} uOptions.resource - name of the resource 
     * @param {number} uOptions.minScale - minimum scale
     * @param {number} uOptions.maxScale - maximum scale
     * @param {Object} options - default layer options
     */
    constructor(uOptions, options) {
        super(uOptions, options)

        // Symbology field properties
        this.symbologyField = undefined

        // Custom Event
        this.loadingStartEvent = new Event('loadingStart');
        this.loadingEndEvent = new Event('loadingEnd');
    }

    /**
     * Default Leaflet initialize method
     * @param {Object} uOptions - custom layer options
     * @param {number} uOptions.minScale - minimum scale visibility
     * @param {number} uOptions.maxScale - maximum scale visibility
     * @param {Object} uOptions.apihelper - reference to the api helper
     * @param {Object} uOptions.request - request to use
     * @param {Object} options - default layer options
     */
    initialize(uOptions, options) {
        var uOptions = uOptions || {}

        /*
                var options = options || { style: this.defineGradientStyle() }*/
        L.GeoJSON.prototype.initialize.call(this, undefined, options);
        L.Util.setOptions(this, uOptions);

        // Warning
        if (this.options.apihelper === undefined) {
            console.warn("apihelper is undefined")
        }
        if (this.options.request === undefined) {
            console.warn("request is undefined")
        }
    }


    /**
     * Event on add
     * @param {Object} map - map object
     */
    onAdd(map) {
        this._map = map;
        map.on('dragend', this.onMoveEnd, this);
        map.on('zoomend', this.onMoveEnd, this);
    }


    /**
     * Event on remove
     * @param {Object} map - map object
     */
    onRemove(map) {
        map.off({ 'dragend': this.onMoveEnd }, this);
        map.off({ 'zoomend': this.onMoveEnd }, this);
    }

    /**
     * On move map
     */
    onMoveEnd() {
        if (this.options.request === undefined) {
            return
        }
        this.options.request.bind(this)()

    }


    /***
     * Define symbology for Polygon and Polyline
     * @param {string} symbologyField - field to use for symbologyField
     * @param {[]} colors
     */
    defineGradientStyle(func) {
        // Fix because setStyle does not work correctly without set the options.style before
        this.options.style = func.bind(this);
        this.setStyle(this.options.style)

    }

    /**
     * Define symbology for Marker
     */
    defineMarkerStyle(func) {
        // Fix because setStyle does not work correctly without set the options.style before
        this.options.style = func.bind(this);
        this.setStyle(this.options.style)
    }

    /**
     * Get a gradient symbology callback
     * @param {string} symbologyField - field to use for symbology 
     * @return {Function} callback gradient symbology function
     */
    static getCellAnalysisGradient(symbologyField, colors) {
        symbologyField = "shop_" + symbologyField.toLowerCase() + "_indice";
        if (colors === undefined) {
            colors = ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641']
        }
        // make color func
        var colorFunc = function (v) {
            var step = 1 / colors.length
            var color_indice = Math.round(v / step) - 1
            color_indice = color_indice < 0 ? 0 : color_indice;
            return colors[color_indice]
        }

        // make style func
        var style = function (feature) {
            return {
                fillColor: colorFunc(feature.properties[symbologyField]),
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.5
            };
        }
        return style;
    }



    /**
     * Cell analysis request
     */
    static cellAnalysisRequest() {

        return function () {

            // out of zoom level
            if (this._map.getZoom() < this.options.minScale || this._map.getZoom() > this.options.maxScale) {
                this.clearLayers();
                return
            }

            // request data
            var api = this.options.apihelper;
            var resource = this.options.resource;
            var xmin = this._map.getBounds()._southWest.lng;
            var ymin = this._map.getBounds()._southWest.lat;
            var xmax = this._map.getBounds()._northEast.lng;
            var ymax = this._map.getBounds()._northEast.lat
            var zlevel = this._map.getZoom()
            
            var zlevelMin = 14;
            var zlevelMax = 18;
            // defaut zoom level
            if (zlevel < zlevelMin) {
                this.clearLayers()
                return
            }
            if (zlevel > zlevelMax) {
                zlevel = zlevelMax
            }
            zlevel = 17
            dispatchEvent(this.loadingStartEvent)
            api.requestCellAnalysisByExtent(xmin, ymin, xmax, ymax, zlevel).then(
                function (data) {
                    this.clearLayers();
                    this.addData(data);
                    dispatchEvent(this.loadingEndEvent)
                }.bind(this));
        }
    }

    /**
     * Standard resource request
     * @param {string} resource - name of the resource
     */
    static resourceRequest() {

        return function () {

            // out of zoom level
            if (this._map.getZoom() < this.options.minScale || this._map.getZoom() > this.options.maxScale) {
                this.clearLayers();
                return
            }

            // request data
            var xmin = this._map.getBounds()._southWest.lng;
            var ymin = this._map.getBounds()._southWest.lat;
            var xmax = this._map.getBounds()._northEast.lng;
            var ymax = this._map.getBounds()._northEast.lat
            var zlevel = this._map.getZoom()

            dispatchEvent(this.loadingStartEvent)
            api.requestGeoIntersectExtentResources(this.options.resource, xmin, ymin, xmax, ymax).then(
                function (data) {
                    this.clearLayers();
                    this.addData(data);
                    dispatchEvent(this.loadingEndEvent)
                }.bind(this));
        }
    }


    static wgs84ToTms (lon, lat, zoom) {
        var lat_rad = lat * (Math.PI / 180);
        var n = Math.pow(2.0, zoom);
        var xtile = parseInt((lon + 180.0) / 360.0 * n);
        var ytile = parseInt((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n)
        return [xtile, ytile, zoom]
    }

    static extentToTms (xmin, ymin, xmax, ymax, zoom) {
        var tiles = [];
        var topLeft = wgs84ToTms(xmin, ymax, zoom);
        var bottomRight = wgs84ToTms(xmax, ymax, zoom);
        for (var xTile = topLeft[0]; xTile <= bottomRight[0]; xTile++) {
            for (var yTile = topLeft[1]; yTile <= bottomRight[1]; yTile++) {
                tiles.push({ x: xTile, y: yTile, z: zoom })
            }
        }
        return tiles
    }

}



export default MyPlaceMapLayer
