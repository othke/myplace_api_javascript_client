import Axios from 'axios'

/** Class representing a MyPlaceAPI helper. 
 *  This class has methods for build MyPlaceAPI Query arguments. Those methods ended by Arg
 *  Others method perform HTTP request on a MyPlaceAPI. Those methods ended by Request.
 * 
 *  MyPlaceAPI is built ontop of MongoDB. Query are iso to MongoDB
*/
class MyPlaceAPIHelper {

    /**
     * Request the MyPlaceAPI
     * @param {string} rootUrl - base root of the url.
     * @param {Object} options - extra options
     * @param {string} options.idField - name of the id field
     * @param {string} options.geometryField - name of the geometry field
     */
    constructor(rootUrl, options) {

        // Options
        var options = options || {};

        // Undefined root url
        if (rootUrl == undefined || rootUrl === "") {
            throw new Error("undefined API URL")
        }

        // Clean root url
        if (rootUrl[rootUrl.length - 1] == "/") {
            rootUrl = rootUrl.substring(0, rootUrl.length - 1)
        }
        this.rootUrl = rootUrl;
    }


    /**
     * Get info
     */
    getInfo() {
        console.log(this.rootUrl);
    }

    /**
     * Helper Methods.
     * Those methods are used to build and perform request
     */

    /**
     * Get a spatial intersect argument
     * @param {number} xmin - xmin coordinate
     * @param {number} ymin - ymin coordinate
     * @param {number} xmax - xmax coordinate
     * @param {number} ymax - ymax coordinate
     * @return {Object} GeoIntersect argument
     */
    getGeoIntersectsSpatialArg(xmin, ymin, xmax, ymax) {
        // Coordinates BBOX of the map
        var coordinates = []
        coordinates.push([xmin, ymin])
        coordinates.push([xmax, ymin])
        coordinates.push([xmax, ymax])
        coordinates.push([xmin, ymax])
        coordinates.push([xmin, ymin])

        var geometry = {
            type: "Polygon",
            coordinates: [coordinates]
        }

        var geoIntersectsSpatialArg = {
            geometry: {
                $geoIntersects: {
                    $geometry: geometry
                }
            }
        }
        return geoIntersectsSpatialArg
    }

    /**
     * Get a spatial near argument
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @param {number} minDistance - minimum distance to search
     * @param {number} maxDistance - maximum distance to search
     * @return {Object} Geonear Mongo argument
     */
    getGeoNearSpatialArg(x, y, minDistance, maxDistance) {

        var minDistance = minDistance || 0
        var maxDistance = maxDistance || 500
        var geometry = {
            type: "Point",
            coordinates: [x, y]
        }

        var geoNearSpatialArg = {
            geometry: {
                $near: {
                    $geometry: geometry,
                    $minDistance: minDistance,
                    $maxDistance: maxDistance
                }
            }
        }
        return geoNearSpatialArg
    }

    /**
     * Get an AND argument
     * @param {Object} arguments variable contains Object to combine with AND
     * @return {Object} AND argument
     */
    getAndArg() {
        var args = [...arguments]
        var andQuery = { $and: args }
        return andQuery
    }

    /**
     * Get an OR argument
     * @param {Object} arguments variable contains Object to combine with OR
     * @return {Object} OR argument
     */
    getOrArg() {
        var args = [...arguments]
        var orQuery = { $or: args }
        return orQuery
    }

    /**
     * Generic request to get a resource by id
     * @param {string} string - name of the resource. Use static properties of MyPlaceAPIHelper
     * @param {number} id - id of the resource
     * @param {Object} options - extra options
     * @param {[string]} options.fields - list of require fields
     * @param {string} options.format - return format (json or geojson)
     * @return {Promise} result of the request
     */
    requestResourceById(resource, id, options) {
        // Prepare parameters
        var options = options || {};
        var fields = options.fields || [];
        var format = options.format || MyPlaceAPIHelper.JSON;
        return new Promise((resolve, reject) => {
            fields = fields.join(',')
            var urlEndPoint = this.rootUrl + '/' + resource + '/' + id;
            // Request
            Axios.get(urlEndPoint, { params: { fields: fields, format: format } })
                .then(function (response) {
                    if (response.data) {
                        resolve(response.data)
                    }
                    else {
                        reject(new Error("No results request"))
                    }
                })
                .catch(function (error) {
                    reject(error)
                })
        })

    }

    /**
     * Generic request to get all resources
     * @param {string} resource - name of the resource. Use static properties of MyPlaceAPIHelper
     * @param {Object} options - extra options
     * @param {[string]} options.fields - list of require fields
     * @param {Object} options.where - where clause to request
     * @param {string} options.format - return format (json or geojson)
     * @return {Promise} result of the request
     */
    requestResources(resource, options) {
        // Prepare parameters
        var options = options || {};
        var fields = options.fields || [];
        var where = options.where || {}
        var format = options.format || MyPlaceAPIHelper.JSON;
        return new Promise((resolve, reject) => {
            fields = fields.join(',')
            var urlEndPoint = this.rootUrl + '/' + resource;
            // Request
            Axios.get(urlEndPoint, { params: { fields: fields, where: where, format: format } })
                .then(function (response) {
                    if (response.data) {
                        resolve(response.data)
                    }
                    else {
                        reject(new Error("No results request"))
                    }
                })
                .catch(function (error) {
                    reject(error)
                })
        })

    }

    /**
     * Request the MyPlace API to get the Near Resources
     * @param {string} resource - name of the resource. Use static properties of MyPlaceAPIHelper
     * @param {number} xmin - xmin coordinate
     * @param {number} ymin - ymin coordinate
     * @param {number} xmax - xmax coordinate
     * @param {number} ymax - ymax coordinate
     * @param {Object} options - extra options
     * @param {number} options.minDistance - minimum search distance (default = 0)
     * @param {number} options.maxDistance - maximum search distance (default = 500)
     * @param {string} options.format - return format (deafut = geojson)
     * @return {Object} nearShop argument
     */
    requestGeoIntersectsResources(resource, xmin, ymin, xmax, ymax, options) {
        // Prepare format arguments
        var options = options || {}
        options.format = options.format || MyPlaceAPIHelper.GEOJSON

        // Prepare where argument
        var geoIntersectsSpatialArg = this.getGeoIntersectsSpatialArg(xmin, ymin, xmax, ymax);
        options.where = geoIntersectsSpatialArg

        return this.requestResources(resource, options)
    }

    /**
     * Request the MyPlace API to get the Near Resources
     * @param {string} resource - name of the resource. Use static properties of MyPlaceAPIHelper
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @param {Object} options - extra options
     * @param {number} options.minDistance - minimum search distance (default = 0)
     * @param {number} options.maxDistance - maximum search distance (default = 500)
     * @param {string} options.format - return format (deafut = geojson)
     * @return {Object} nearShop argument
     */
    requestGeoNearResources(resource, x, y, options) {
        // Prepare format arguments
        var options = options || {}
        options.format = options.format || MyPlaceAPIHelper.GEOJSON

        // Prepare where argument
        var minDistance = options.minDistance || 0
        var maxDistance = options.maxDistance || 500
        var geoNearSpatialArg = this.getGeoNearSpatialArg(x, y, minDistance, maxDistance);
        options.where = geoNearSpatialArg

        return this.requestResources(resource, options)
    }


    /**
     * Shortcuts methods.
     * Those methods are simplified access to resources
     */

    /**
     * Get all the code shop
     * @return {Object} JSON object representing the description of type of shop
     */
    requestShopType(){
        return this.requestResources(MyPlaceAPIHelper.SHOP_TYPE)
    }

    /**
     * Request the MyPlace API to get the Near Shop by type
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @param {string} code_shop - shopping code
     * @param {Object} options - extra options
     * @param {number} options.minDistance - minimum search distance (default = 0)
     * @param {number} options.maxDistance - maximum search distance (default = 500)
     * @param {string} options.format - return format (deafut = geojson)
     * @return {Object} nearShop argument
     */
    requestNearShopByType(x, y, code_shop, options) {

        // Prepare format arguments
        var options = options || {}
        options.format = options.format || MyPlaceAPIHelper.GEOJSON

        // Prepare where argument
        var code_shop = code_shop
        var minDistance = options.minDistance || 0
        var maxDistance = options.maxDistance || 500
        var geoNearSpatialArg = this.getGeoNearSpatialArg(x, y, minDistance, maxDistance);
        var shopArg = { code_shop: code_shop }
        var nearShopArg = this.getAndArg(geoNearSpatialArg, shopArg)
        options.where = nearShopArg

        return this.requestResources(MyPlaceAPIHelper.SHOP, options)
    }

    /**
     * Request the Place analysis 
     * @param {number} xmin - xmin coordinate
     * @param {number} ymin - ymin coordinate
     * @param {number} xmax - xmax coordinate
     * @param {number} ymax - ymax coordinate
     * @param {number} zlevel - zlevel value
     * @param {Object} options - extra options
     * @param {string} options.format - output format
     * @return {Object} GeoJSON representing the result of the analysis
     */
    requestCellAnalysisByExtent(xmin, ymin, xmax, ymax, zlevel, options) {
        // Prepare arguments
        var options = options || {};
        options.format = options.format || MyPlaceAPIHelper.GEOJSON

        // Prepare where argument
        var zLevelArg = {z: zlevel.toString()}
        var geoIntersectsSpatialArg = this.getGeoIntersectsSpatialArg(xmin, ymin, xmax, ymax)
        var requestArg = this.getAndArg(zLevelArg, geoIntersectsSpatialArg) 
        options.where = requestArg

        return this.requestResources(MyPlaceAPIHelper.CELL_ANALYSIS, options)
    }
}

// Static properties
MyPlaceAPIHelper.IRIS = 'iris';
MyPlaceAPIHelper.SHOP = 'shop';
MyPlaceAPIHelper.SHOP_TYPE = 'shop_type';
MyPlaceAPIHelper.CONSO_NAT_PROD = 'conso_nat_prod';
MyPlaceAPIHelper.PRODUCT = 'product';
MyPlaceAPIHelper.REGION = 'region';
MyPlaceAPIHelper.ROAD = 'road';
MyPlaceAPIHelper.TRANSPORTATION = 'transportation';
MyPlaceAPIHelper.TYPE_TERRITORY = 'type_territory';
MyPlaceAPIHelper.ZONE_GEOGRAPHY = 'zone_geography';
MyPlaceAPIHelper.CELL_ANALYSIS = "cell_analysis";

// Formats
MyPlaceAPIHelper.JSON = "json";
MyPlaceAPIHelper.GEOJSON = "geojson";


export default MyPlaceAPIHelper;