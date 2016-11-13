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
        this.options.style = func.bind(this);

    }

    /**
     * Define symbology for Marker
     */
    defineMarkerStyle(func) {
        this.options.pointToLayer = func.bind(this);
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
            var xmin = mymap.getBounds()._southWest.lng;
            var ymin = mymap.getBounds()._southWest.lat;
            var xmax = mymap.getBounds()._northEast.lng;
            var ymax = mymap.getBounds()._northEast.lat
            var zlevel = mymap.getZoom()

            // zoom request limit
            if (zlevel < 14) {
                zlevel = 14
            }
            if (zlevel > 17) {
                zlevel = 17
            }
            api.requestCellAnalysisByExtent(xmin, ymin, xmax, ymax, zlevel).then(
                function (data) {
                    this.clearLayers();
                    this.addData(data);
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
            var xmin = mymap.getBounds()._southWest.lng;
            var ymin = mymap.getBounds()._southWest.lat;
            var xmax = mymap.getBounds()._northEast.lng;
            var ymax = mymap.getBounds()._northEast.lat
            var zlevel = mymap.getZoom()

            api.requestGeoIntersectsResources(this.options.resource, xmin, ymin, xmax, ymax).then(
                function (data) {
                    this.clearLayers();
                    this.addData(data);
                }.bind(this));
        }
    }

}



export default MyPlaceMapLayer
