var fs = require('fs-extra');
var path = require('path');
var lang;
exports.loadLanguage = function (id) {
    lang = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lang', id + ".json"))) || {};
};
exports.query = function (id) {
    var query = id.split('.');
    var res = lang;
    for (var _i = 0, query_1 = query; _i < query_1.length; _i++) {
        var q = query_1[_i];
        res = res[q];
    }
    return res === lang ? {} : res;
};
exports.queryJS = function (id) {
    return exports.query("js." + id);
};
