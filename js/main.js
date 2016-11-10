import MyPlaceAPIHelper from './MyPlaceAPIHelper.js'

window.url = 'http://localhost/api/v1/';
window.MyPlaceAPIHelper = MyPlaceAPIHelper;
window.api = new window.MyPlaceAPIHelper(window.url);
window.options = {};
