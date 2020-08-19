var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var fs = require('fs');
var path = require('path');
var request = require('request');
var ConfigManager = require('./configmanager');
var logger = require('./loggerutil')('%c[DistroManager]', 'color: #a02d2a; font-weight: bold');
/**
 * Represents the download information
 * for a specific module.
 */
var Artifact = /** @class */ (function () {
    function Artifact() {
    }
    /**
     * Parse a JSON object into an Artifact.
     *
     * @param {Object} json A JSON object representing an Artifact.
     *
     * @returns {Artifact} The parsed Artifact.
     */
    Artifact.fromJSON = function (json) {
        return Object.assign(new Artifact(), json);
    };
    /**
     * Get the MD5 hash of the artifact. This value may
     * be undefined for artifacts which are not to be
     * validated and updated.
     *
     * @returns {string} The MD5 hash of the Artifact or undefined.
     */
    Artifact.prototype.getHash = function () {
        return this.MD5;
    };
    /**
     * @returns {number} The download size of the artifact.
     */
    Artifact.prototype.getSize = function () {
        return this.size;
    };
    /**
     * @returns {string} The download url of the artifact.
     */
    Artifact.prototype.getURL = function () {
        return this.url;
    };
    /**
     * @returns {string} The artifact's destination path.
     */
    Artifact.prototype.getPath = function () {
        return this.path;
    };
    return Artifact;
}());
exports.Artifact;
/**
 * Represents a the requirement status
 * of a module.
 */
var Required = /** @class */ (function () {
    function Required(value, def) {
        this.value = value;
        this.default = def;
    }
    /**
     * Parse a JSON object into a Required object.
     *
     * @param {Object} json A JSON object representing a Required object.
     *
     * @returns {Required} The parsed Required object.
     */
    Required.fromJSON = function (json) {
        if (json == null) {
            return new Required(true, true);
        }
        else {
            return new Required(json.value == null ? true : json.value, json.def == null ? true : json.def);
        }
    };
    /**
     * Get the default value for a required object. If a module
     * is not required, this value determines whether or not
     * it is enabled by default.
     *
     * @returns {boolean} The default enabled value.
     */
    Required.prototype.isDefault = function () {
        return this.default;
    };
    /**
     * @returns {boolean} Whether or not the module is required.
     */
    Required.prototype.isRequired = function () {
        return this.value;
    };
    return Required;
}());
exports.Required;
/**
 * Represents a module.
 */
var Module = /** @class */ (function () {
    function Module(id, name, type, required, artifact, subModules, serverid) {
        this.identifier = id;
        this.type = type;
        this._resolveMetaData();
        this.name = name;
        this.required = Required.fromJSON(required);
        this.artifact = Artifact.fromJSON(artifact);
        this._resolveArtifactPath(artifact.path, serverid);
        this._resolveSubModules(subModules, serverid);
    }
    /**
     * Parse a JSON object into a Module.
     *
     * @param {Object} json A JSON object representing a Module.
     * @param {string} serverid The ID of the server to which this module belongs.
     *
     * @returns {Module} The parsed Module.
     */
    Module.fromJSON = function (json, serverid) {
        return new Module(json.id, json.name, json.type, json.required, json.artifact, json.subModules, serverid);
    };
    /**
     * Resolve the default extension for a specific module type.
     *
     * @param {string} type The type of the module.
     *
     * @return {string} The default extension for the given type.
     */
    Module._resolveDefaultExtension = function (type) {
        switch (type) {
            case exports.Types.Library:
            case exports.Types.ForgeHosted:
            case exports.Types.LiteLoader:
            case exports.Types.ForgeMod:
                return 'jar';
            case exports.Types.LiteMod:
                return 'litemod';
            case exports.Types.File:
            default:
                return 'jar'; // There is no default extension really.
        }
    };
    Module.prototype._resolveMetaData = function () {
        try {
            var m0 = this.identifier.split('@');
            this.artifactExt = m0[1] || Module._resolveDefaultExtension(this.type);
            var m1 = m0[0].split(':');
            this.artifactClassifier = m1[3] || undefined;
            this.artifactVersion = m1[2] || '???';
            this.artifactID = m1[1] || '???';
            this.artifactGroup = m1[0] || '???';
        }
        catch (err) {
            // Improper identifier
            logger.error('Improper ID for module', this.identifier, err);
        }
    };
    Module.prototype._resolveArtifactPath = function (artifactPath, serverid) {
        var pth = artifactPath == null ? path.join.apply(path, __spreadArrays(this.getGroup().split('.'), [this.getID(), this.getVersion(), this.getID() + "-" + this.getVersion() + (this.artifactClassifier != undefined ? "-" + this.artifactClassifier : '') + "." + this.getExtension()])) : artifactPath;
        switch (this.type) {
            case exports.Types.Library:
            case exports.Types.ForgeHosted:
            case exports.Types.LiteLoader:
                this.artifact.path = path.join(ConfigManager.getCommonDirectory(), 'libraries', pth);
                break;
            case exports.Types.ForgeMod:
            case exports.Types.LiteMod:
                this.artifact.path = path.join(ConfigManager.getCommonDirectory(), 'modstore', pth);
                break;
            case exports.Types.VersionManifest:
                this.artifact.path = path.join(ConfigManager.getCommonDirectory(), 'versions', this.getIdentifier(), this.getIdentifier() + ".json");
                break;
            case exports.Types.File:
            default:
                this.artifact.path = path.join(ConfigManager.getInstanceDirectory(), serverid, pth);
                break;
        }
    };
    Module.prototype._resolveSubModules = function (json, serverid) {
        var arr = [];
        if (json != null) {
            for (var _i = 0, json_1 = json; _i < json_1.length; _i++) {
                var sm = json_1[_i];
                arr.push(Module.fromJSON(sm, serverid));
            }
        }
        this.subModules = arr.length > 0 ? arr : null;
    };
    /**
     * @returns {string} The full, unparsed module identifier.
     */
    Module.prototype.getIdentifier = function () {
        return this.identifier;
    };
    /**
     * @returns {string} The name of the module.
     */
    Module.prototype.getName = function () {
        return this.name;
    };
    /**
     * @returns {Required} The required object declared by this module.
     */
    Module.prototype.getRequired = function () {
        return this.required;
    };
    /**
     * @returns {Artifact} The artifact declared by this module.
     */
    Module.prototype.getArtifact = function () {
        return this.artifact;
    };
    /**
     * @returns {string} The maven identifier of this module's artifact.
     */
    Module.prototype.getID = function () {
        return this.artifactID;
    };
    /**
     * @returns {string} The maven group of this module's artifact.
     */
    Module.prototype.getGroup = function () {
        return this.artifactGroup;
    };
    /**
     * @returns {string} The identifier without he version or extension.
     */
    Module.prototype.getVersionlessID = function () {
        return this.getGroup() + ':' + this.getID();
    };
    /**
     * @returns {string} The identifier without the extension.
     */
    Module.prototype.getExtensionlessID = function () {
        return this.getIdentifier().split('@')[0];
    };
    /**
     * @returns {string} The version of this module's artifact.
     */
    Module.prototype.getVersion = function () {
        return this.artifactVersion;
    };
    /**
     * @returns {string} The classifier of this module's artifact
     */
    Module.prototype.getClassifier = function () {
        return this.artifactClassifier;
    };
    /**
     * @returns {string} The extension of this module's artifact.
     */
    Module.prototype.getExtension = function () {
        return this.artifactExt;
    };
    /**
     * @returns {boolean} Whether or not this module has sub modules.
     */
    Module.prototype.hasSubModules = function () {
        return this.subModules != null;
    };
    /**
     * @returns {Array.<Module>} An array of sub modules.
     */
    Module.prototype.getSubModules = function () {
        return this.subModules;
    };
    /**
     * @returns {string} The type of the module.
     */
    Module.prototype.getType = function () {
        return this.type;
    };
    return Module;
}());
exports.Module;
/**
 * Represents a server configuration.
 */
var Server = /** @class */ (function () {
    function Server() {
    }
    /**
     * Parse a JSON object into a Server.
     *
     * @param {Object} json A JSON object representing a Server.
     *
     * @returns {Server} The parsed Server object.
     */
    Server.fromJSON = function (json) {
        var mdls = json.modules;
        json.modules = [];
        var serv = Object.assign(new Server(), json);
        serv._resolveModules(mdls);
        return serv;
    };
    Server.prototype._resolveModules = function (json) {
        var arr = [];
        for (var _i = 0, json_2 = json; _i < json_2.length; _i++) {
            var m = json_2[_i];
            arr.push(Module.fromJSON(m, this.getID()));
        }
        this.modules = arr;
    };
    /**
     * @returns {string} The ID of the server.
     */
    Server.prototype.getID = function () {
        return this.id;
    };
    /**
     * @returns {string} The name of the server.
     */
    Server.prototype.getName = function () {
        return this.name;
    };
    /**
     * @returns {string} The description of the server.
     */
    Server.prototype.getDescription = function () {
        return this.description;
    };
    /**
     * @returns {string} The URL of the server's icon.
     */
    Server.prototype.getIcon = function () {
        return this.icon;
    };
    /**
     * @returns {string} The version of the server configuration.
     */
    Server.prototype.getVersion = function () {
        return this.version;
    };
    /**
     * @returns {string} The IP address of the server.
     */
    Server.prototype.getAddress = function () {
        return this.address;
    };
    /**
     * @returns {string} The minecraft version of the server.
     */
    Server.prototype.getMinecraftVersion = function () {
        return this.minecraftVersion;
    };
    /**
     * @returns {boolean} Whether or not this server is the main
     * server. The main server is selected by the launcher when
     * no valid server is selected.
     */
    Server.prototype.isMainServer = function () {
        return this.mainServer;
    };
    /**
     * @returns {boolean} Whether or not the server is autoconnect.
     * by default.
     */
    Server.prototype.isAutoConnect = function () {
        return this.autoconnect;
    };
    /**
     * @returns {Array.<Module>} An array of modules for this server.
     */
    Server.prototype.getModules = function () {
        return this.modules;
    };
    return Server;
}());
exports.Server;
/**
 * Represents the Distribution Index.
 */
var DistroIndex = /** @class */ (function () {
    function DistroIndex() {
    }
    /**
     * Parse a JSON object into a DistroIndex.
     *
     * @param {Object} json A JSON object representing a DistroIndex.
     *
     * @returns {DistroIndex} The parsed Server object.
     */
    DistroIndex.fromJSON = function (json) {
        var servers = json.servers;
        json.servers = [];
        var distro = Object.assign(new DistroIndex(), json);
        distro._resolveServers(servers);
        distro._resolveMainServer();
        return distro;
    };
    DistroIndex.prototype._resolveServers = function (json) {
        var arr = [];
        for (var _i = 0, json_3 = json; _i < json_3.length; _i++) {
            var s = json_3[_i];
            arr.push(Server.fromJSON(s));
        }
        this.servers = arr;
    };
    DistroIndex.prototype._resolveMainServer = function () {
        for (var _i = 0, _a = this.servers; _i < _a.length; _i++) {
            var serv_1 = _a[_i];
            if (serv_1.mainServer) {
                this.mainServer = serv_1.id;
                return;
            }
        }
        // If no server declares default_selected, default to the first one declared.
        this.mainServer = (this.servers.length > 0) ? this.servers[0].getID() : null;
    };
    /**
     * @returns {string} The version of the distribution index.
     */
    DistroIndex.prototype.getVersion = function () {
        return this.version;
    };
    /**
     * @returns {string} The URL to the news RSS feed.
     */
    DistroIndex.prototype.getRSS = function () {
        return this.rss;
    };
    /**
     * @returns {Array.<Server>} An array of declared server configurations.
     */
    DistroIndex.prototype.getServers = function () {
        return this.servers;
    };
    /**
     * Get a server configuration by its ID. If it does not
     * exist, null will be returned.
     *
     * @param {string} id The ID of the server.
     *
     * @returns {Server} The server configuration with the given ID or null.
     */
    DistroIndex.prototype.getServer = function (id) {
        for (var _i = 0, _a = this.servers; _i < _a.length; _i++) {
            var serv_2 = _a[_i];
            if (serv_2.id === id) {
                return serv_2;
            }
        }
        return null;
    };
    /**
     * Get the main server.
     *
     * @returns {Server} The main server.
     */
    DistroIndex.prototype.getMainServer = function () {
        return this.mainServer != null ? this.getServer(this.mainServer) : null;
    };
    return DistroIndex;
}());
exports.DistroIndex;
exports.Types = {
    Library: 'Library',
    ForgeHosted: 'ForgeHosted',
    Forge: 'Forge',
    LiteLoader: 'LiteLoader',
    ForgeMod: 'ForgeMod',
    LiteMod: 'LiteMod',
    File: 'File',
    VersionManifest: 'VersionManifest'
};
var DEV_MODE = false;
var DISTRO_PATH = path.join(ConfigManager.getLauncherDirectory(), 'distribution.json');
var DEV_PATH = path.join(ConfigManager.getLauncherDirectory(), 'dev_distribution.json');
var data = null;
/**
 * @returns {Promise.<DistroIndex>}
 */
exports.pullRemote = function () {
    if (DEV_MODE) {
        return exports.pullLocal();
    }
    return new Promise(function (resolve, reject) {
        var distroURL = 'https://mysql.songs-of-war.com/distribution.json';
        var opts = {
            url: distroURL,
            timeout: 30000
        };
        var distroDest = path.join(ConfigManager.getLauncherDirectory(), 'distribution.json');
        request(opts, function (error, resp, body) {
            if (!error) {
                try {
                    data = DistroIndex.fromJSON(JSON.parse(body));
                }
                catch (e) {
                    reject(e);
                }
                fs.writeFile(distroDest, body, 'utf-8', function (err) {
                    if (!err) {
                        resolve(data);
                    }
                    else {
                        reject(err);
                    }
                });
            }
            else {
                reject(error);
            }
        });
    });
};
/**
 * @returns {Promise.<DistroIndex>}
 */
exports.pullLocal = function () {
    return new Promise(function (resolve, reject) {
        fs.readFile(DEV_MODE ? DEV_PATH : DISTRO_PATH, 'utf-8', function (err, d) {
            if (!err) {
                data = DistroIndex.fromJSON(JSON.parse(d));
                resolve(data);
            }
            else {
                reject(err);
            }
        });
    });
};
exports.setDevMode = function (value) {
    if (value) {
        logger.log('Developer mode enabled.');
        logger.log('If you don\'t know what that means, revert immediately.');
    }
    else {
        logger.log('Developer mode disabled.');
    }
    DEV_MODE = value;
};
exports.isDevMode = function () {
    return DEV_MODE;
};
/**
 * @returns {DistroIndex}
 */
exports.getDistribution = function () {
    return data;
};
