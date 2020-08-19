var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var fs = require('fs');
var ConfigManager = require('./configmanager');
var LoggerUtil = /** @class */ (function () {
    function LoggerUtil(prefix, style) {
        this.prefix = prefix;
        this.style = style;
    }
    LoggerUtil.prototype.log = function () {
        console.log.apply(null, __spreadArrays([this.prefix, this.style], arguments));
        fs.appendFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', '[LOG]' + this.prefix + JSON.stringify(arguments) + '\n');
    };
    LoggerUtil.prototype.info = function () {
        console.info.apply(null, __spreadArrays([this.prefix, this.style], arguments));
        fs.appendFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', '[INFO]' + this.prefix + JSON.stringify(arguments) + '\n');
    };
    LoggerUtil.prototype.warn = function () {
        console.warn.apply(null, __spreadArrays([this.prefix, this.style], arguments));
        fs.appendFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', '[WARN]' + this.prefix + JSON.stringify(arguments) + '\n');
    };
    LoggerUtil.prototype.debug = function () {
        console.debug.apply(null, __spreadArrays([this.prefix, this.style], arguments));
        fs.appendFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', '[DEBUG]' + this.prefix + JSON.stringify(arguments) + '\n');
    };
    LoggerUtil.prototype.error = function () {
        console.error.apply(null, __spreadArrays([this.prefix, this.style], arguments));
        fs.appendFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', '[ERROR]' + this.prefix + JSON.stringify(arguments) + '\n');
    };
    return LoggerUtil;
}());
module.exports = function (prefix, style) {
    return new LoggerUtil(prefix, style);
};
