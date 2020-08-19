var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
// Requirements
var AdmZip = require('adm-zip');
var async = require('async');
var child_process = require('child_process');
var crypto = require('crypto');
var EventEmitter = require('events');
var fs = require('fs-extra');
var path = require('path');
var Registry = require('winreg');
var request = require('request');
var tar = require('tar-fs');
var zlib = require('zlib');
var got = require('got');
//Fuck it, I didn't want to spend my time making an algorithm to loop over the path
var shelljs = require('shelljs');
var ConfigManager = require('./configmanager');
var DistroManager = require('./distromanager');
var isDev = require('./isdev');
var data = require('jquery').data;
// Constants
// const PLATFORM_MAP = {
//     win32: '-windows-x64.tar.gz',
//     darwin: '-macosx-x64.tar.gz',
//     linux: '-linux-x64.tar.gz'
// }
// Classes
/** Class representing a base asset. */
var Asset = /** @class */ (function () {
    /**
     * Create an asset.
     *
     * @param {any} id The id of the asset.
     * @param {string} hash The hash value of the asset.
     * @param {number} size The size in bytes of the asset.
     * @param {string} from The url where the asset can be found.
     * @param {string} to The absolute local file path of the asset.
     */
    function Asset(id, hash, size, from, to) {
        this.id = id;
        this.hash = hash;
        this.size = size;
        this.from = from;
        this.to = to;
    }
    return Asset;
}());
/** Class representing a mojang library. */
var Library = /** @class */ (function (_super) {
    __extends(Library, _super);
    function Library() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Converts the process.platform OS names to match mojang's OS names.
     */
    Library.mojangFriendlyOS = function () {
        var opSys = process.platform;
        if (opSys === 'darwin') {
            return 'osx';
        }
        else if (opSys === 'win32') {
            return 'windows';
        }
        else if (opSys === 'linux') {
            return 'linux';
        }
        else {
            return 'unknown_os';
        }
    };
    /**
     * Checks whether or not a library is valid for download on a particular OS, following
     * the rule format specified in the mojang version data index. If the allow property has
     * an OS specified, then the library can ONLY be downloaded on that OS. If the disallow
     * property has instead specified an OS, the library can be downloaded on any OS EXCLUDING
     * the one specified.
     *
     * If the rules are undefined, the natives property will be checked for a matching entry
     * for the current OS.
     *
     * @param {Array.<Object>} rules The Library's download rules.
     * @param {Object} natives The Library's natives object.
     * @returns {boolean} True if the Library follows the specified rules, otherwise false.
     */
    Library.validateRules = function (rules, natives) {
        if (rules == null) {
            if (natives == null) {
                return true;
            }
            else {
                return natives[Library.mojangFriendlyOS()] != null;
            }
        }
        for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
            var rule = rules_1[_i];
            var action = rule.action;
            var osProp = rule.os;
            if (action != null && osProp != null) {
                var osName = osProp.name;
                var osMoj = Library.mojangFriendlyOS();
                if (action === 'allow') {
                    return osName === osMoj;
                }
                else if (action === 'disallow') {
                    return osName !== osMoj;
                }
            }
        }
        return true;
    };
    return Library;
}(Asset));
var DistroModule = /** @class */ (function (_super) {
    __extends(DistroModule, _super);
    /**
     * Create a DistroModule. This is for processing,
     * not equivalent to the module objects in the
     * distro index.
     *
     * @param {any} id The id of the asset.
     * @param {string} hash The hash value of the asset.
     * @param {number} size The size in bytes of the asset.
     * @param {string} from The url where the asset can be found.
     * @param {string} to The absolute local file path of the asset.
     * @param {string} type The the module type.
     */
    function DistroModule(id, hash, size, from, to, type) {
        var _this = _super.call(this, id, hash, size, from, to) || this;
        _this.type = type;
        return _this;
    }
    return DistroModule;
}(Asset));
/**
 * Class representing a download tracker. This is used to store meta data
 * about a download queue, including the queue itself.
 */
var DLTracker = /** @class */ (function () {
    /**
     * Create a DLTracker
     *
     * @param {Array.<Asset>} dlqueue An array containing assets queued for download.
     * @param {number} dlsize The combined size of each asset in the download queue array.
     * @param {function(Asset)} callback Optional callback which is called when an asset finishes downloading.
     */
    function DLTracker(dlqueue, dlsize, callback) {
        if (callback === void 0) { callback = null; }
        this.dlqueue = dlqueue;
        this.dlsize = dlsize;
        this.callback = callback;
    }
    return DLTracker;
}());
var Util = /** @class */ (function () {
    function Util() {
    }
    /**
     * Returns true if the actual version is greater than
     * or equal to the desired version.
     *
     * @param {string} desired The desired version.
     * @param {string} actual The actual version.
     */
    Util.mcVersionAtLeast = function (desired, actual) {
        var des = desired.split('.');
        var act = actual.split('.');
        for (var i = 0; i < des.length; i++) {
            if (!(parseInt(act[i]) >= parseInt(des[i]))) {
                return false;
            }
        }
        return true;
    };
    Util.isForgeGradle3 = function (mcVersion, forgeVersion) {
        if (Util.mcVersionAtLeast('1.13', mcVersion)) {
            return true;
        }
        try {
            var forgeVer = forgeVersion.split('-')[1];
            var maxFG2 = [14, 23, 5, 2847];
            var verSplit = forgeVer.split('.').map(function (v) { return Number(v); });
            for (var i = 0; i < maxFG2.length; i++) {
                if (verSplit[i] > maxFG2[i]) {
                    return true;
                }
                else if (verSplit[i] < maxFG2[i]) {
                    return false;
                }
            }
            return false;
        }
        catch (err) {
            throw new Error('Forge version is complex (changed).. launcher requires a patch.');
        }
    };
    Util.isAutoconnectBroken = function (forgeVersion) {
        var minWorking = [31, 2, 15];
        var verSplit = forgeVersion.split('.').map(function (v) { return Number(v); });
        if (verSplit[0] === 31) {
            for (var i = 0; i < minWorking.length; i++) {
                if (verSplit[i] > minWorking[i]) {
                    return false;
                }
                else if (verSplit[i] < minWorking[i]) {
                    return true;
                }
            }
        }
        return false;
    };
    return Util;
}());
var JavaGuard = /** @class */ (function (_super) {
    __extends(JavaGuard, _super);
    function JavaGuard(mcVersion) {
        var _this = _super.call(this) || this;
        _this.mcVersion = mcVersion;
        return _this;
    }
    // /**
    //  * @typedef OracleJREData
    //  * @property {string} uri The base uri of the JRE.
    //  * @property {{major: string, update: string, build: string}} version Object containing version information.
    //  */
    // /**
    //  * Resolves the latest version of Oracle's JRE and parses its download link.
    //  * 
    //  * @returns {Promise.<OracleJREData>} Promise which resolved to an object containing the JRE download data.
    //  */
    // static _latestJREOracle(){
    //     const url = 'https://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html'
    //     const regex = /https:\/\/.+?(?=\/java)\/java\/jdk\/([0-9]+u[0-9]+)-(b[0-9]+)\/([a-f0-9]{32})?\/jre-\1/
    //     return new Promise((resolve, reject) => {
    //         request(url, (err, resp, body) => {
    //             if(!err){
    //                 const arr = body.match(regex)
    //                 const verSplit = arr[1].split('u')
    //                 resolve({
    //                     uri: arr[0],
    //                     version: {
    //                         major: verSplit[0],
    //                         update: verSplit[1],
    //                         build: arr[2]
    //                     }
    //                 })
    //             } else {
    //                 resolve(null)
    //             }
    //         })
    //     })
    // }
    /**
     * @typedef OpenJDKData
     * @property {string} uri The base uri of the JRE.
     * @property {number} size The size of the download.
     * @property {string} name The name of the artifact.
     */
    /**
     * Fetch the last open JDK binary. Uses https://api.adoptopenjdk.net/
     *
     * @param {string} major The major version of Java to fetch.
     *
     * @returns {Promise.<OpenJDKData>} Promise which resolved to an object containing the JRE download data.
     */
    JavaGuard._latestOpenJDK = function (major) {
        if (major === void 0) { major = '8'; }
        var sanitizedOS = process.platform === 'win32' ? 'windows' : (process.platform === 'darwin' ? 'mac' : process.platform);
        var url = "https://api.adoptopenjdk.net/v2/latestAssets/nightly/openjdk" + major + "?os=" + sanitizedOS + "&arch=x64&heap_size=normal&openjdk_impl=hotspot&type=jre";
        return new Promise(function (resolve, reject) {
            request({ url: url, json: true }, function (err, resp, body) {
                if (!err && body.length > 0) {
                    resolve({
                        uri: body[0].binary_link,
                        size: body[0].binary_size,
                        name: body[0].binary_name
                    });
                }
                else {
                    resolve(null);
                }
            });
        });
    };
    /**
     * Returns the path of the OS-specific executable for the given Java
     * installation. Supported OS's are win32, darwin, linux.
     *
     * @param {string} rootDir The root directory of the Java installation.
     * @returns {string} The path to the Java executable.
     */
    JavaGuard.javaExecFromRoot = function (rootDir) {
        if (process.platform === 'win32') {
            return path.join(rootDir, 'bin', 'javaw.exe');
        }
        else if (process.platform === 'darwin') {
            return path.join(rootDir, 'Contents', 'Home', 'bin', 'java');
        }
        else if (process.platform === 'linux') {
            return path.join(rootDir, 'bin', 'java');
        }
        return rootDir;
    };
    /**
     * Check to see if the given path points to a Java executable.
     *
     * @param {string} pth The path to check against.
     * @returns {boolean} True if the path points to a Java executable, otherwise false.
     */
    JavaGuard.isJavaExecPath = function (pth) {
        if (process.platform === 'win32') {
            return pth.endsWith(path.join('bin', 'javaw.exe'));
        }
        else if (process.platform === 'darwin') {
            return pth.endsWith(path.join('bin', 'java'));
        }
        else if (process.platform === 'linux') {
            return pth.endsWith(path.join('bin', 'java'));
        }
        return false;
    };
    /**
     * Load Mojang's launcher.json file.
     *
     * @returns {Promise.<Object>} Promise which resolves to Mojang's launcher.json object.
     */
    JavaGuard.loadMojangLauncherData = function () {
        return new Promise(function (resolve, reject) {
            request.get('https://launchermeta.mojang.com/mc/launcher.json', function (err, resp, body) {
                if (err) {
                    resolve(null);
                }
                else {
                    resolve(JSON.parse(body));
                }
            });
        });
    };
    /**
     * Parses a **full** Java Runtime version string and resolves
     * the version information. Dynamically detects the formatting
     * to use.
     *
     * @param {string} verString Full version string to parse.
     * @returns Object containing the version information.
     */
    JavaGuard.parseJavaRuntimeVersion = function (verString) {
        var major = verString.split('.')[0];
        if (major == 1) {
            return JavaGuard._parseJavaRuntimeVersion_8(verString);
        }
        else {
            return JavaGuard._parseJavaRuntimeVersion_9(verString);
        }
    };
    /**
     * Parses a **full** Java Runtime version string and resolves
     * the version information. Uses Java 8 formatting.
     *
     * @param {string} verString Full version string to parse.
     * @returns Object containing the version information.
     */
    JavaGuard._parseJavaRuntimeVersion_8 = function (verString) {
        // 1.{major}.0_{update}-b{build}
        // ex. 1.8.0_152-b16
        var ret = {};
        var pts = verString.split('-');
        ret.build = parseInt(pts[1].substring(1));
        pts = pts[0].split('_');
        ret.update = parseInt(pts[1]);
        ret.major = parseInt(pts[0].split('.')[1]);
        return ret;
    };
    /**
     * Parses a **full** Java Runtime version string and resolves
     * the version information. Uses Java 9+ formatting.
     *
     * @param {string} verString Full version string to parse.
     * @returns Object containing the version information.
     */
    JavaGuard._parseJavaRuntimeVersion_9 = function (verString) {
        // {major}.{minor}.{revision}+{build}
        // ex. 10.0.2+13
        var ret = {};
        var pts = verString.split('+');
        ret.build = parseInt(pts[1]);
        pts = pts[0].split('.');
        ret.major = parseInt(pts[0]);
        ret.minor = parseInt(pts[1]);
        ret.revision = parseInt(pts[2]);
        return ret;
    };
    /**
     * Validates the output of a JVM's properties. Currently validates that a JRE is x64
     * and that the major = 8, update > 52.
     *
     * @param {string} stderr The output to validate.
     *
     * @returns {Promise.<Object>} A promise which resolves to a meta object about the JVM.
     * The validity is stored inside the `valid` property.
     */
    JavaGuard.prototype._validateJVMProperties = function (stderr) {
        var res = stderr;
        var props = res.split('\n');
        var goal = 2;
        var checksum = 0;
        var meta = {};
        for (var i = 0; i < props.length; i++) {
            if (props[i].indexOf('sun.arch.data.model') > -1) {
                var arch = props[i].split('=')[1].trim();
                arch = parseInt(arch);
                console.log(props[i].trim());
                if (arch === 64) {
                    meta.arch = arch;
                    ++checksum;
                    if (checksum === goal) {
                        break;
                    }
                }
            }
            else if (props[i].indexOf('java.runtime.version') > -1) {
                var verString = props[i].split('=')[1].trim();
                console.log(props[i].trim());
                var verOb = JavaGuard.parseJavaRuntimeVersion(verString);
                if (verOb.major < 9) {
                    // Java 8
                    if (verOb.major === 8 && verOb.update > 52) {
                        meta.version = verOb;
                        ++checksum;
                        if (checksum === goal) {
                            break;
                        }
                    }
                }
                else {
                    // Java 9+
                    if (Util.mcVersionAtLeast('1.13', this.mcVersion)) {
                        console.log('Java 9+ not yet tested.');
                        /* meta.version = verOb
                        ++checksum
                        if(checksum === goal){
                            break
                        } */
                    }
                }
            }
        }
        meta.valid = checksum === goal;
        return meta;
    };
    /**
     * Validates that a Java binary is at least 64 bit. This makes use of the non-standard
     * command line option -XshowSettings:properties. The output of this contains a property,
     * sun.arch.data.model = ARCH, in which ARCH is either 32 or 64. This option is supported
     * in Java 8 and 9. Since this is a non-standard option. This will resolve to true if
     * the function's code throws errors. That would indicate that the option is changed or
     * removed.
     *
     * @param {string} binaryExecPath Path to the java executable we wish to validate.
     *
     * @returns {Promise.<Object>} A promise which resolves to a meta object about the JVM.
     * The validity is stored inside the `valid` property.
     */
    JavaGuard.prototype._validateJavaBinary = function (binaryExecPath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!JavaGuard.isJavaExecPath(binaryExecPath)) {
                resolve({ valid: false });
            }
            else if (fs.existsSync(binaryExecPath)) {
                // Workaround (javaw.exe no longer outputs this information.)
                console.log(typeof binaryExecPath);
                if (binaryExecPath.indexOf('javaw.exe') > -1) {
                    binaryExecPath.replace('javaw.exe', 'java.exe');
                }
                child_process.exec('"' + binaryExecPath + '" -XshowSettings:properties', function (err, stdout, stderr) {
                    try {
                        // Output is stored in stderr?
                        resolve(_this._validateJVMProperties(stderr));
                    }
                    catch (err) {
                        // Output format might have changed, validation cannot be completed.
                        resolve({ valid: false });
                    }
                });
            }
            else {
                resolve({ valid: false });
            }
        });
    };
    /**
     * Checks for the presence of the environment variable JAVA_HOME. If it exits, we will check
     * to see if the value points to a path which exists. If the path exits, the path is returned.
     *
     * @returns {string} The path defined by JAVA_HOME, if it exists. Otherwise null.
     */
    JavaGuard._scanJavaHome = function () {
        var jHome = process.env.JAVA_HOME;
        try {
            var res = fs.existsSync(jHome);
            return res ? jHome : null;
        }
        catch (err) {
            // Malformed JAVA_HOME property.
            return null;
        }
    };
    /**
     * Scans the registry for 64-bit Java entries. The paths of each entry are added to
     * a set and returned. Currently, only Java 8 (1.8) is supported.
     *
     * @returns {Promise.<Set.<string>>} A promise which resolves to a set of 64-bit Java root
     * paths found in the registry.
     */
    JavaGuard._scanRegistry = function () {
        return new Promise(function (resolve, reject) {
            // Keys for Java v9.0.0 and later:
            // 'SOFTWARE\\JavaSoft\\JRE'
            // 'SOFTWARE\\JavaSoft\\JDK'
            // Forge does not yet support Java 9, therefore we do not.
            // Keys for Java 1.8 and prior:
            var regKeys = [
                '\\SOFTWARE\\JavaSoft\\Java Runtime Environment',
                '\\SOFTWARE\\JavaSoft\\Java Development Kit'
            ];
            var keysDone = 0;
            var candidates = new Set();
            var _loop_1 = function (i) {
                var key = new Registry({
                    hive: Registry.HKLM,
                    key: regKeys[i],
                    arch: 'x64'
                });
                key.keyExists(function (err, exists) {
                    if (exists) {
                        key.keys(function (err, javaVers) {
                            if (err) {
                                keysDone++;
                                console.error(err);
                                // REG KEY DONE
                                // DUE TO ERROR
                                if (keysDone === regKeys.length) {
                                    resolve(candidates);
                                }
                            }
                            else {
                                if (javaVers.length === 0) {
                                    // REG KEY DONE
                                    // NO SUBKEYS
                                    keysDone++;
                                    if (keysDone === regKeys.length) {
                                        resolve(candidates);
                                    }
                                }
                                else {
                                    var numDone_1 = 0;
                                    for (var j = 0; j < javaVers.length; j++) {
                                        var javaVer = javaVers[j];
                                        var vKey = javaVer.key.substring(javaVer.key.lastIndexOf('\\') + 1);
                                        // Only Java 8 is supported currently.
                                        if (parseFloat(vKey) === 1.8) {
                                            javaVer.get('JavaHome', function (err, res) {
                                                var jHome = res.value;
                                                if (jHome.indexOf('(x86)') === -1) {
                                                    candidates.add(jHome);
                                                }
                                                // SUBKEY DONE
                                                numDone_1++;
                                                if (numDone_1 === javaVers.length) {
                                                    keysDone++;
                                                    if (keysDone === regKeys.length) {
                                                        resolve(candidates);
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            // SUBKEY DONE
                                            // NOT JAVA 8
                                            numDone_1++;
                                            if (numDone_1 === javaVers.length) {
                                                keysDone++;
                                                if (keysDone === regKeys.length) {
                                                    resolve(candidates);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                    else {
                        // REG KEY DONE
                        // DUE TO NON-EXISTANCE
                        keysDone++;
                        if (keysDone === regKeys.length) {
                            resolve(candidates);
                        }
                    }
                });
            };
            for (var i = 0; i < regKeys.length; i++) {
                _loop_1(i);
            }
        });
    };
    /**
     * See if JRE exists in the Internet Plug-Ins folder.
     *
     * @returns {string} The path of the JRE if found, otherwise null.
     */
    JavaGuard._scanInternetPlugins = function () {
        // /Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home/bin/java
        var pth = '/Library/Internet Plug-Ins/JavaAppletPlugin.plugin';
        var res = fs.existsSync(JavaGuard.javaExecFromRoot(pth));
        return res ? pth : null;
    };
    /**
     * Scan a directory for root JVM folders.
     *
     * @param {string} scanDir The directory to scan.
     * @returns {Promise.<Set.<string>>} A promise which resolves to a set of the discovered
     * root JVM folders.
     */
    JavaGuard._scanFileSystem = function (scanDir) {
        return new Promise(function (resolve, reject) {
            fs.exists(scanDir, function (e) {
                var res = new Set();
                if (e) {
                    fs.readdir(scanDir, function (err, files) {
                        if (err) {
                            resolve(res);
                            console.log(err);
                        }
                        else {
                            var pathsDone_1 = 0;
                            var _loop_2 = function (i) {
                                var combinedPath = path.join(scanDir, files[i]);
                                var execPath = JavaGuard.javaExecFromRoot(combinedPath);
                                fs.exists(execPath, function (v) {
                                    if (v) {
                                        res.add(combinedPath);
                                    }
                                    ++pathsDone_1;
                                    if (pathsDone_1 === files.length) {
                                        resolve(res);
                                    }
                                });
                            };
                            for (var i = 0; i < files.length; i++) {
                                _loop_2(i);
                            }
                            if (pathsDone_1 === files.length) {
                                resolve(res);
                            }
                        }
                    });
                }
                else {
                    resolve(res);
                }
            });
        });
    };
    /**
     *
     * @param {Set.<string>} rootSet A set of JVM root strings to validate.
     * @returns {Promise.<Object[]>} A promise which resolves to an array of meta objects
     * for each valid JVM root directory.
     */
    JavaGuard.prototype._validateJavaRootSet = function (rootSet) {
        return __awaiter(this, void 0, void 0, function () {
            var rootArr, validArr, i, execPath, metaOb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rootArr = Array.from(rootSet);
                        validArr = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < rootArr.length)) return [3 /*break*/, 4];
                        execPath = JavaGuard.javaExecFromRoot(rootArr[i]);
                        return [4 /*yield*/, this._validateJavaBinary(execPath)];
                    case 2:
                        metaOb = _a.sent();
                        if (metaOb.valid) {
                            metaOb.execPath = execPath;
                            validArr.push(metaOb);
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, validArr];
                }
            });
        });
    };
    /**
     * Sort an array of JVM meta objects. Best candidates are placed before all others.
     * Sorts based on version and gives priority to JREs over JDKs if versions match.
     *
     * @param {Object[]} validArr An array of JVM meta objects.
     * @returns {Object[]} A sorted array of JVM meta objects.
     */
    JavaGuard._sortValidJavaArray = function (validArr) {
        var retArr = validArr.sort(function (a, b) {
            if (a.version.major === b.version.major) {
                if (a.version.major < 9) {
                    // Java 8
                    if (a.version.update === b.version.update) {
                        if (a.version.build === b.version.build) {
                            // Same version, give priority to JRE.
                            if (a.execPath.toLowerCase().indexOf('jdk') > -1) {
                                return b.execPath.toLowerCase().indexOf('jdk') > -1 ? 0 : 1;
                            }
                            else {
                                return -1;
                            }
                        }
                        else {
                            return a.version.build > b.version.build ? -1 : 1;
                        }
                    }
                    else {
                        return a.version.update > b.version.update ? -1 : 1;
                    }
                }
                else {
                    // Java 9+
                    if (a.version.minor === b.version.minor) {
                        if (a.version.revision === b.version.revision) {
                            // Same version, give priority to JRE.
                            if (a.execPath.toLowerCase().indexOf('jdk') > -1) {
                                return b.execPath.toLowerCase().indexOf('jdk') > -1 ? 0 : 1;
                            }
                            else {
                                return -1;
                            }
                        }
                        else {
                            return a.version.revision > b.version.revision ? -1 : 1;
                        }
                    }
                    else {
                        return a.version.minor > b.version.minor ? -1 : 1;
                    }
                }
            }
            else {
                return a.version.major > b.version.major ? -1 : 1;
            }
        });
        return retArr;
    };
    /**
     * Attempts to find a valid x64 installation of Java on Windows machines.
     * Possible paths will be pulled from the registry and the JAVA_HOME environment
     * variable. The paths will be sorted with higher versions preceeding lower, and
     * JREs preceeding JDKs. The binaries at the sorted paths will then be validated.
     * The first validated is returned.
     *
     * Higher versions > Lower versions
     * If versions are equal, JRE > JDK.
     *
     * @param {string} dataDir The base launcher directory.
     * @returns {Promise.<string>} A Promise which resolves to the executable path of a valid
     * x64 Java installation. If none are found, null is returned.
     */
    JavaGuard.prototype._win32JavaValidate = function (dataDir) {
        return __awaiter(this, void 0, void 0, function () {
            var pathSet1, pathSet2, uberSet, jHome, pathArr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, JavaGuard._scanRegistry()];
                    case 1:
                        pathSet1 = _a.sent();
                        if (pathSet1.length === 0) {
                            // Do a manual file system scan of program files.
                            pathSet1 = JavaGuard._scanFileSystem('C:\\Program Files\\Java');
                        }
                        return [4 /*yield*/, JavaGuard._scanFileSystem(path.join(dataDir, 'runtime', 'x64'))
                            // Merge the results.
                        ];
                    case 2:
                        pathSet2 = _a.sent();
                        uberSet = new Set(__spreadArrays(pathSet1, pathSet2));
                        jHome = JavaGuard._scanJavaHome();
                        if (jHome != null && jHome.indexOf('(x86)') === -1) {
                            uberSet.add(jHome);
                        }
                        return [4 /*yield*/, this._validateJavaRootSet(uberSet)];
                    case 3:
                        pathArr = _a.sent();
                        pathArr = JavaGuard._sortValidJavaArray(pathArr);
                        if (pathArr.length > 0) {
                            return [2 /*return*/, pathArr[0].execPath];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Attempts to find a valid x64 installation of Java on MacOS.
     * The system JVM directory is scanned for possible installations.
     * The JAVA_HOME enviroment variable and internet plugins directory
     * are also scanned and validated.
     *
     * Higher versions > Lower versions
     * If versions are equal, JRE > JDK.
     *
     * @param {string} dataDir The base launcher directory.
     * @returns {Promise.<string>} A Promise which resolves to the executable path of a valid
     * x64 Java installation. If none are found, null is returned.
     */
    JavaGuard.prototype._darwinJavaValidate = function (dataDir) {
        return __awaiter(this, void 0, void 0, function () {
            var pathSet1, pathSet2, uberSet, iPPath, jHome, pathArr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, JavaGuard._scanFileSystem('/Library/Java/JavaVirtualMachines')];
                    case 1:
                        pathSet1 = _a.sent();
                        return [4 /*yield*/, JavaGuard._scanFileSystem(path.join(dataDir, 'runtime', 'x64'))];
                    case 2:
                        pathSet2 = _a.sent();
                        uberSet = new Set(__spreadArrays(pathSet1, pathSet2));
                        iPPath = JavaGuard._scanInternetPlugins();
                        if (iPPath != null) {
                            uberSet.add(iPPath);
                        }
                        jHome = JavaGuard._scanJavaHome();
                        if (jHome != null) {
                            // Ensure we are at the absolute root.
                            if (jHome.contains('/Contents/Home')) {
                                jHome = jHome.substring(0, jHome.indexOf('/Contents/Home'));
                            }
                            uberSet.add(jHome);
                        }
                        return [4 /*yield*/, this._validateJavaRootSet(uberSet)];
                    case 3:
                        pathArr = _a.sent();
                        pathArr = JavaGuard._sortValidJavaArray(pathArr);
                        if (pathArr.length > 0) {
                            return [2 /*return*/, pathArr[0].execPath];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Attempts to find a valid x64 installation of Java on Linux.
     * The system JVM directory is scanned for possible installations.
     * The JAVA_HOME enviroment variable is also scanned and validated.
     *
     * Higher versions > Lower versions
     * If versions are equal, JRE > JDK.
     *
     * @param {string} dataDir The base launcher directory.
     * @returns {Promise.<string>} A Promise which resolves to the executable path of a valid
     * x64 Java installation. If none are found, null is returned.
     */
    JavaGuard.prototype._linuxJavaValidate = function (dataDir) {
        return __awaiter(this, void 0, void 0, function () {
            var pathSet1, pathSet2, uberSet, jHome, pathArr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, JavaGuard._scanFileSystem('/usr/lib/jvm')];
                    case 1:
                        pathSet1 = _a.sent();
                        return [4 /*yield*/, JavaGuard._scanFileSystem(path.join(dataDir, 'runtime', 'x64'))];
                    case 2:
                        pathSet2 = _a.sent();
                        uberSet = new Set(__spreadArrays(pathSet1, pathSet2));
                        jHome = JavaGuard._scanJavaHome();
                        if (jHome != null) {
                            uberSet.add(jHome);
                        }
                        return [4 /*yield*/, this._validateJavaRootSet(uberSet)];
                    case 3:
                        pathArr = _a.sent();
                        pathArr = JavaGuard._sortValidJavaArray(pathArr);
                        if (pathArr.length > 0) {
                            return [2 /*return*/, pathArr[0].execPath];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retrieve the path of a valid x64 Java installation.
     *
     * @param {string} dataDir The base launcher directory.
     * @returns {string} A path to a valid x64 Java installation, null if none found.
     */
    JavaGuard.prototype.validateJava = function (dataDir) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this['_' + process.platform + 'JavaValidate'](dataDir)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return JavaGuard;
}(EventEmitter));
/**
 * Central object class used for control flow. This object stores data about
 * categories of downloads. Each category is assigned an identifier with a
 * DLTracker object as its value. Combined information is also stored, such as
 * the total size of all the queued files in each category. This event is used
 * to emit events so that external modules can listen into processing done in
 * this module.
 */
var AssetGuard = /** @class */ (function (_super) {
    __extends(AssetGuard, _super);
    /**
     * Create an instance of AssetGuard.
     * On creation the object's properties are never-null default
     * values. Each identifier is resolved to an empty DLTracker.
     *
     * @param {string} commonPath The common path for shared game files.
     * @param {string} javaexec The path to a java executable which will be used
     * to finalize installation.
     */
    function AssetGuard(commonPath, javaexec) {
        var _this = _super.call(this) || this;
        _this.totaldlsize = 0;
        _this.progress = 0;
        _this.assets = new DLTracker([], 0);
        _this.libraries = new DLTracker([], 0);
        _this.files = new DLTracker([], 0);
        _this.forge = new DLTracker([], 0);
        _this.java = new DLTracker([], 0);
        _this.extractQueue = [];
        _this.commonPath = commonPath;
        _this.javaexec = javaexec;
        return _this;
    }
    // Static Utility Functions
    // #region
    // Static Hash Validation Functions
    // #region
    /**
     * Calculates the hash for a file using the specified algorithm.
     *
     * @param {Buffer} buf The buffer containing file data.
     * @param {string} algo The hash algorithm.
     * @returns {string} The calculated hash in hex.
     */
    AssetGuard._calculateHash = function (buf, algo) {
        return crypto.createHash(algo).update(buf).digest('hex');
    };
    /**
     * Used to parse a checksums file. This is specifically designed for
     * the checksums.sha1 files found inside the forge scala dependencies.
     *
     * @param {string} content The string content of the checksums file.
     * @returns {Object} An object with keys being the file names, and values being the hashes.
     */
    AssetGuard._parseChecksumsFile = function (content) {
        var finalContent = {};
        var lines = content.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var bits = lines[i].split(' ');
            if (bits[1] == null) {
                continue;
            }
            finalContent[bits[1]] = bits[0];
        }
        return finalContent;
    };
    /**
     * Validate that a file exists and matches a given hash value.
     *
     * @param {string} filePath The path of the file to validate.
     * @param {string} algo The hash algorithm to check against.
     * @param {string} hash The existing hash to check against.
     * @returns {boolean} True if the file exists and calculated hash matches the given hash, otherwise false.
     */
    AssetGuard._validateLocal = function (filePath, algo, hash) {
        if (fs.existsSync(filePath)) {
            //No hash provided, have to assume it's good.
            if (hash == null) {
                return true;
            }
            var buf = fs.readFileSync(filePath);
            var calcdhash = AssetGuard._calculateHash(buf, algo);
            return calcdhash === hash.toLowerCase();
        }
        return false;
    };
    /**
     * Validates a file in the style used by forge's version index.
     *
     * @param {string} filePath The path of the file to validate.
     * @param {Array.<string>} checksums The checksums listed in the forge version index.
     * @returns {boolean} True if the file exists and the hashes match, otherwise false.
     */
    AssetGuard._validateForgeChecksum = function (filePath, checksums) {
        if (fs.existsSync(filePath)) {
            if (checksums == null || checksums.length === 0) {
                return true;
            }
            var buf = fs.readFileSync(filePath);
            var calcdhash = AssetGuard._calculateHash(buf, 'sha1');
            var valid = checksums.includes(calcdhash);
            if (!valid && filePath.endsWith('.jar')) {
                valid = AssetGuard._validateForgeJar(filePath, checksums);
            }
            return valid;
        }
        return false;
    };
    /**
     * Validates a forge jar file dependency who declares a checksums.sha1 file.
     * This can be an expensive task as it usually requires that we calculate thousands
     * of hashes.
     *
     * @param {Buffer} buf The buffer of the jar file.
     * @param {Array.<string>} checksums The checksums listed in the forge version index.
     * @returns {boolean} True if all hashes declared in the checksums.sha1 file match the actual hashes.
     */
    AssetGuard._validateForgeJar = function (buf, checksums) {
        // Double pass method was the quickest I found. I tried a version where we store data
        // to only require a single pass, plus some quick cleanup but that seemed to take slightly more time.
        var hashes = {};
        var expected = {};
        var zip = new AdmZip(buf);
        var zipEntries = zip.getEntries();
        //First pass
        for (var i = 0; i < zipEntries.length; i++) {
            var entry = zipEntries[i];
            if (entry.entryName === 'checksums.sha1') {
                expected = AssetGuard._parseChecksumsFile(zip.readAsText(entry));
            }
            hashes[entry.entryName] = AssetGuard._calculateHash(entry.getData(), 'sha1');
        }
        if (!checksums.includes(hashes['checksums.sha1'])) {
            return false;
        }
        //Check against expected
        var expectedEntries = Object.keys(expected);
        for (var i = 0; i < expectedEntries.length; i++) {
            if (expected[expectedEntries[i]] !== hashes[expectedEntries[i]]) {
                return false;
            }
        }
        return true;
    };
    // #endregion
    // Miscellaneous Static Functions
    // #region
    /**
     * Extracts and unpacks a file from .pack.xz format.
     *
     * @param {Array.<string>} filePaths The paths of the files to be extracted and unpacked.
     * @returns {Promise.<void>} An empty promise to indicate the extraction has completed.
     */
    AssetGuard._extractPackXZ = function (filePaths, javaExecutable) {
        console.log('[PackXZExtract] Starting');
        return new Promise(function (resolve, reject) {
            var libPath;
            if (isDev) {
                libPath = path.join(process.cwd(), 'libraries', 'java', 'PackXZExtract.jar');
            }
            else {
                if (process.platform === 'darwin') {
                    libPath = path.join(process.cwd(), 'Contents', 'Resources', 'libraries', 'java', 'PackXZExtract.jar');
                }
                else {
                    libPath = path.join(process.cwd(), 'resources', 'libraries', 'java', 'PackXZExtract.jar');
                }
            }
            var filePath = filePaths.join(',');
            var child = child_process.spawn(javaExecutable, ['-jar', libPath, '-packxz', filePath]);
            child.stdout.on('data', function (data) {
                console.log('[PackXZExtract]', data.toString('utf8'));
            });
            child.stderr.on('data', function (data) {
                console.log('[PackXZExtract]', data.toString('utf8'));
            });
            child.on('close', function (code, signal) {
                console.log('[PackXZExtract]', 'Exited with code', code);
                resolve();
            });
        });
    };
    /**
     * Function which finalizes the forge installation process. This creates a 'version'
     * instance for forge and saves its version.json file into that instance. If that
     * instance already exists, the contents of the version.json file are read and returned
     * in a promise.
     *
     * @param {Asset} asset The Asset object representing Forge.
     * @param {string} commonPath The common path for shared game files.
     * @returns {Promise.<Object>} A promise which resolves to the contents of forge's version.json.
     */
    AssetGuard._finalizeForgeAsset = function (asset, commonPath) {
        return new Promise(function (resolve, reject) {
            fs.readFile(asset.to, function (err, data) {
                var zip = new AdmZip(data);
                var zipEntries = zip.getEntries();
                for (var i = 0; i < zipEntries.length; i++) {
                    if (zipEntries[i].entryName === 'version.json') {
                        var forgeVersion = JSON.parse(zip.readAsText(zipEntries[i]));
                        var versionPath = path.join(commonPath, 'versions', forgeVersion.id);
                        var versionFile = path.join(versionPath, forgeVersion.id + '.json');
                        if (!fs.existsSync(versionFile)) {
                            fs.ensureDirSync(versionPath);
                            fs.writeFileSync(path.join(versionPath, forgeVersion.id + '.json'), zipEntries[i].getData());
                            resolve(forgeVersion);
                        }
                        else {
                            //Read the saved file to allow for user modifications.
                            resolve(JSON.parse(fs.readFileSync(versionFile, 'utf-8')));
                        }
                        return;
                    }
                }
                //We didn't find forge's version.json.
                reject('Unable to finalize Forge processing, version.json not found! Has forge changed their format?');
            });
        });
    };
    // #endregion
    // #endregion
    // Validation Functions
    // #region
    /**
     * Loads the version data for a given minecraft version.
     *
     * @param {string} version The game version for which to load the index data.
     * @param {boolean} force Optional. If true, the version index will be downloaded even if it exists locally. Defaults to false.
     * @returns {Promise.<Object>} Promise which resolves to the version data object.
     */
    AssetGuard.prototype.loadVersionData = function (version, force) {
        var _this = this;
        if (force === void 0) { force = false; }
        var self = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var versionPath, versionFile, url, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        versionPath = path.join(self.commonPath, 'versions', version);
                        versionFile = path.join(versionPath, version + '.json');
                        if (!(!fs.existsSync(versionFile) || force)) return [3 /*break*/, 2];
                        return [4 /*yield*/, self._getVersionDataUrl(version)
                            //This download will never be tracked as it's essential and trivial.
                        ];
                    case 1:
                        url = _a.sent();
                        //This download will never be tracked as it's essential and trivial.
                        console.log('Preparing download of ' + version + ' assets.');
                        fs.ensureDirSync(versionPath);
                        stream = request(url).pipe(fs.createWriteStream(versionFile));
                        stream.on('finish', function () {
                            resolve(JSON.parse(fs.readFileSync(versionFile)));
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        resolve(JSON.parse(fs.readFileSync(versionFile)));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Parses Mojang's version manifest and retrieves the url of the version
     * data index.
     *
     * @param {string} version The version to lookup.
     * @returns {Promise.<string>} Promise which resolves to the url of the version data index.
     * If the version could not be found, resolves to null.
     */
    AssetGuard.prototype._getVersionDataUrl = function (version) {
        return new Promise(function (resolve, reject) {
            request('https://launchermeta.mojang.com/mc/game/version_manifest.json', function (error, resp, body) {
                if (error) {
                    reject(error);
                }
                else {
                    var manifest = JSON.parse(body);
                    for (var _i = 0, _a = manifest.versions; _i < _a.length; _i++) {
                        var v = _a[_i];
                        if (v.id === version) {
                            resolve(v.url);
                        }
                    }
                    resolve(null);
                }
            });
        });
    };
    // Asset (Category=''') Validation Functions
    // #region
    /**
     * Public asset validation function. This function will handle the validation of assets.
     * It will parse the asset index specified in the version data, analyzing each
     * asset entry. In this analysis it will check to see if the local file exists and is valid.
     * If not, it will be added to the download queue for the 'assets' identifier.
     *
     * @param {Object} versionData The version data for the assets.
     * @param {boolean} force Optional. If true, the asset index will be downloaded even if it exists locally. Defaults to false.
     * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
     */
    AssetGuard.prototype.validateAssets = function (versionData, force) {
        if (force === void 0) { force = false; }
        var self = this;
        return new Promise(function (resolve, reject) {
            self._assetChainIndexData(versionData, force).then(function () {
                resolve();
            });
        });
    };
    //Chain the asset tasks to provide full async. The below functions are private.
    /**
     * Private function used to chain the asset validation process. This function retrieves
     * the index data.
     * @param {Object} versionData
     * @param {boolean} force
     * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
     */
    AssetGuard.prototype._assetChainIndexData = function (versionData, force) {
        if (force === void 0) { force = false; }
        var self = this;
        return new Promise(function (resolve, reject) {
            //Asset index constants.
            var assetIndex = versionData.assetIndex;
            var name = assetIndex.id + '.json';
            var indexPath = path.join(self.commonPath, 'assets', 'indexes');
            var assetIndexLoc = path.join(indexPath, name);
            var data = null;
            if (!fs.existsSync(assetIndexLoc) || force) {
                console.log('Downloading ' + versionData.id + ' asset index.');
                fs.ensureDirSync(indexPath);
                var stream = got.stream(assetIndex.url).pipe(fs.createWriteStream(assetIndexLoc));
                stream.on('finish', function () {
                    data = JSON.parse(fs.readFileSync(assetIndexLoc, 'utf-8'));
                    self._assetChainValidateAssets(versionData, data).then(function () {
                        resolve();
                    });
                });
            }
            else {
                data = JSON.parse(fs.readFileSync(assetIndexLoc, 'utf-8'));
                self._assetChainValidateAssets(versionData, data).then(function () {
                    resolve();
                });
            }
        });
    };
    /**
     * Private function used to chain the asset validation process. This function processes
     * the assets and enqueues missing or invalid files.
     * @param {Object} versionData
     * @param {boolean} force
     * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
     */
    AssetGuard.prototype._assetChainValidateAssets = function (versionData, indexData) {
        var self = this;
        return new Promise(function (resolve, reject) {
            //Asset constants
            var resourceURL = 'http://resources.download.minecraft.net/';
            var localPath = path.join(self.commonPath, 'assets');
            var objectPath = path.join(localPath, 'objects');
            var assetDlQueue = [];
            var dlSize = 0;
            var acc = 0;
            var total = Object.keys(indexData.objects).length;
            //const objKeys = Object.keys(data.objects)
            async.forEachOfLimit(indexData.objects, 10, function (value, key, cb) {
                acc++;
                self.emit('progress', 'assets', acc, total);
                var hash = value.hash;
                var assetName = path.join(hash.substring(0, 2), hash);
                var urlName = hash.substring(0, 2) + '/' + hash;
                var ast = new Asset(key, hash, value.size, resourceURL + urlName, path.join(objectPath, assetName));
                if (!AssetGuard._validateLocal(ast.to, 'sha1', ast.hash)) {
                    dlSize += (ast.size * 1);
                    assetDlQueue.push(ast);
                }
                cb();
            }, function (err) {
                self.assets = new DLTracker(assetDlQueue, dlSize);
                resolve();
            });
        });
    };
    // #endregion
    // Library (Category=''') Validation Functions
    // #region
    /**
     * Public library validation function. This function will handle the validation of libraries.
     * It will parse the version data, analyzing each library entry. In this analysis, it will
     * check to see if the local file exists and is valid. If not, it will be added to the download
     * queue for the 'libraries' identifier.
     *
     * @param {Object} versionData The version data for the assets.
     * @returns {Promise.<boolean>} A value that if true indicates if a download was initiated.
     */
    AssetGuard.prototype.validateLibraries = function (versionData) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var libArr = versionData.libraries;
            var libPath = path.join(self.commonPath, 'libraries');
            var libDlQueue = [];
            var dlSize = 0;
            console.log('Starting lib check');
            var requiresInstall = false;
            //Check validity of each library. If the hashs don't match, download the library.
            async.eachLimit(libArr, 5, function (lib, cb) {
                if (Library.validateRules(lib.rules, lib.natives)) {
                    var artifact = (lib.natives == null) ? lib.downloads.artifact : lib.downloads.classifiers[lib.natives[Library.mojangFriendlyOS()].replace('${arch}', process.arch.replace('x', ''))];
                    var libItm = new Library(lib.name, artifact.sha1, artifact.size, artifact.url, path.join(libPath, artifact.path));
                    if (!AssetGuard._validateLocal(libItm.to, 'sha1', libItm.hash)) {
                        dlSize += (libItm.size * 1);
                        libDlQueue.push(libItm);
                        requiresInstall = true;
                    }
                }
                cb();
            }, function (err) {
                self.libraries = new DLTracker(libDlQueue, dlSize);
                resolve(requiresInstall);
            });
        });
    };
    // #endregion
    // Miscellaneous (Category=files) Validation Functions
    // #region
    /**
     * Public miscellaneous mojang file validation function. These files will be enqueued under
     * the 'files' identifier.
     *
     * @param {Object} versionData The version data for the assets.
     * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
     */
    AssetGuard.prototype.validateMiscellaneous = function (versionData) {
        var _this = this;
        var self = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, self.validateClient(versionData)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, self.validateLogConfig(versionData)];
                    case 2:
                        _a.sent();
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Validate client file - artifact renamed from client.jar to '{version}'.jar.
     *
     * @param {Object} versionData The version data for the assets.
     * @param {boolean} force Optional. If true, the asset index will be downloaded even if it exists locally. Defaults to false.
     * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
     */
    AssetGuard.prototype.validateClient = function (versionData, force) {
        if (force === void 0) { force = false; }
        var self = this;
        return new Promise(function (resolve, reject) {
            var clientData = versionData.downloads.client;
            var version = versionData.id;
            var targetPath = path.join(self.commonPath, 'versions', version);
            var targetFile = version + '.jar';
            var client = new Asset(version + ' client', clientData.sha1, clientData.size, clientData.url, path.join(targetPath, targetFile));
            if (!AssetGuard._validateLocal(client.to, 'sha1', client.hash) || force) {
                self.files.dlqueue.push(client);
                self.files.dlsize += client.size * 1;
                resolve();
            }
            else {
                resolve();
            }
        });
    };
    /**
     * Validate log config.
     *
     * @param {Object} versionData The version data for the assets.
     * @param {boolean} force Optional. If true, the asset index will be downloaded even if it exists locally. Defaults to false.
     * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
     */
    AssetGuard.prototype.validateLogConfig = function (versionData) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var client = versionData.logging.client;
            var file = client.file;
            var targetPath = path.join(self.commonPath, 'assets', 'log_configs');
            var logConfig = new Asset(file.id, file.sha1, file.size, file.url, path.join(targetPath, file.id));
            if (!AssetGuard._validateLocal(logConfig.to, 'sha1', logConfig.hash)) {
                self.files.dlqueue.push(logConfig);
                self.files.dlsize += logConfig.size * 1;
                resolve();
            }
            else {
                resolve();
            }
        });
    };
    // #endregion
    // Distribution (Category=forge) Validation Functions
    // #region
    /**
     * Validate the distribution.
     *
     * @param {Server} server The Server to validate.
     * @returns {Promise.<Object>} A promise which resolves to the server distribution object.
     */
    AssetGuard.prototype.validateDistribution = function (server) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.forge = self._parseDistroModules(server.getModules(), server.getMinecraftVersion(), server.getID());
            resolve(server);
        });
    };
    AssetGuard.prototype._parseDistroModules = function (modules, version, servid) {
        var alist = [];
        var asize = 0;
        for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
            var ob = modules_1[_i];
            var obArtifact = ob.getArtifact();
            var obPath = obArtifact.getPath();
            var artifact = new DistroModule(ob.getIdentifier(), obArtifact.getHash(), obArtifact.getSize(), obArtifact.getURL(), obPath, ob.getType());
            var validationPath = obPath.toLowerCase().endsWith('.pack.xz') ? obPath.substring(0, obPath.toLowerCase().lastIndexOf('.pack.xz')) : obPath;
            if (!AssetGuard._validateLocal(validationPath, 'MD5', artifact.hash)) {
                asize += artifact.size * 1;
                alist.push(artifact);
                if (validationPath !== obPath)
                    this.extractQueue.push(obPath);
            }
            //Recursively process the submodules then combine the results.
            if (ob.getSubModules() != null) {
                var dltrack = this._parseDistroModules(ob.getSubModules(), version, servid);
                asize += dltrack.dlsize * 1;
                alist = alist.concat(dltrack.dlqueue);
            }
        }
        return new DLTracker(alist, asize);
    };
    /**
     * Loads Forge's version.json data into memory for the specified server id.
     *
     * @param {string} server The Server to load Forge data for.
     * @returns {Promise.<Object>} A promise which resolves to Forge's version.json data.
     */
    AssetGuard.prototype.loadForgeData = function (server) {
        var _this = this;
        var self = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var modules, _i, modules_2, ob, type, _a, _b, sub, obArtifact, obPath, asset, forgeData_1, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        modules = server.getModules();
                        _i = 0, modules_2 = modules;
                        _c.label = 1;
                    case 1:
                        if (!(_i < modules_2.length)) return [3 /*break*/, 8];
                        ob = modules_2[_i];
                        type = ob.getType();
                        if (!(type === DistroManager.Types.ForgeHosted || type === DistroManager.Types.Forge)) return [3 /*break*/, 7];
                        if (!Util.isForgeGradle3(server.getMinecraftVersion(), ob.getVersion())) return [3 /*break*/, 2];
                        // Read Manifest
                        for (_a = 0, _b = ob.getSubModules(); _a < _b.length; _a++) {
                            sub = _b[_a];
                            if (sub.getType() === DistroManager.Types.VersionManifest) {
                                resolve(JSON.parse(fs.readFileSync(sub.getArtifact().getPath(), 'utf-8')));
                                return [2 /*return*/];
                            }
                        }
                        reject('No forge version manifest found!');
                        return [2 /*return*/];
                    case 2:
                        obArtifact = ob.getArtifact();
                        obPath = obArtifact.getPath();
                        asset = new DistroModule(ob.getIdentifier(), obArtifact.getHash(), obArtifact.getSize(), obArtifact.getURL(), obPath, type);
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, AssetGuard._finalizeForgeAsset(asset, self.commonPath)];
                    case 4:
                        forgeData_1 = _c.sent();
                        resolve(forgeData_1);
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _c.sent();
                        reject(err_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8:
                        reject('No forge module found!');
                        return [2 /*return*/];
                }
            });
        }); });
    };
    AssetGuard.prototype._parseForgeLibraries = function () {
        /* TODO
        * Forge asset validations are already implemented. When there's nothing much
        * to work on, implement forge downloads using forge's version.json. This is to
        * have the code on standby if we ever need it (since it's half implemented already).
        */
    };
    // #endregion
    // Java (Category=''') Validation (download) Functions
    // #region
    AssetGuard.prototype._enqueueOpenJDK = function (dataDir) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // I am getting severly annoyed at the amount of mac fixes I have to do...
            if (process.platform !== 'darwin') {
                JavaGuard._latestOpenJDK('8').then(function (verData) {
                    if (verData != null) {
                        dataDir = path.join(dataDir, 'runtime', 'x64');
                        var fDir = path.join(dataDir, verData.name);
                        var jre = new Asset(verData.name, null, verData.size, verData.uri, fDir);
                        _this.java = new DLTracker([jre], jre.size, function (a, self) {
                            if (verData.name.endsWith('zip')) {
                                var zip = new AdmZip(a.to);
                                var pos_1 = path.join(dataDir, zip.getEntries()[0].entryName);
                                zip.extractAllToAsync(dataDir, true, function (err) {
                                    if (err) {
                                        console.log(err);
                                        self.emit('complete', 'java', JavaGuard.javaExecFromRoot(pos_1));
                                    }
                                    else {
                                        fs.unlink(a.to, function (err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            self.emit('complete', 'java', JavaGuard.javaExecFromRoot(pos_1));
                                        });
                                    }
                                });
                            }
                            else {
                                // Tar.gz
                                var h_1 = null;
                                fs.createReadStream(a.to)
                                    .on('error', function (err) { return console.log(err); })
                                    .pipe(zlib.createGunzip())
                                    .on('error', function (err) { return console.log(err); })
                                    .pipe(tar.extract(dataDir, {
                                    map: function (header) {
                                        if (h_1 == null) {
                                            h_1 = header.name;
                                        }
                                    }
                                }))
                                    .on('error', function (err) { return console.log(err); })
                                    .on('finish', function () {
                                    fs.unlink(a.to, function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        if (h_1.indexOf('/') > -1) {
                                            h_1 = h_1.substring(0, h_1.indexOf('/'));
                                        }
                                        var pos = path.join(dataDir, h_1);
                                        self.emit('complete', 'java', JavaGuard.javaExecFromRoot(pos));
                                    });
                                });
                            }
                        });
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            }
            else {
                try {
                    // Download the java shit from Mojang themselves
                    (function () { return __awaiter(_this, void 0, void 0, function () {
                        var manifest, javamanifesturl, javamanifest, JavaAssets, _i, _a, key, pathDir, fileName, FileSizes, AssetSize, CurExecTimes;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    dataDir = path.join(dataDir, 'runtime', 'x64');
                                    return [4 /*yield*/, got('https://launchermeta.mojang.com/v1/products/launcher/022631aeac4a9addbce8e0503dce662152dc198d/mac-os.json')];
                                case 1:
                                    manifest = _b.sent();
                                    javamanifesturl = JSON.parse(manifest.body)['jre-x64'][0]['manifest']['url'] // Kek, I don't see anything wrong with this
                                    ;
                                    return [4 /*yield*/, got(javamanifesturl)];
                                case 2:
                                    javamanifest = _b.sent();
                                    javamanifest = JSON.parse(javamanifest.body)['files'];
                                    JavaAssets = [];
                                    for (_i = 0, _a = Object.keys(javamanifest); _i < _a.length; _i++) {
                                        key = _a[_i];
                                        pathDir = key.substring(10).split('/');
                                        pathDir[pathDir.length - 1] = null;
                                        pathDir = pathDir.join('/').toString();
                                        fileName = key.substring(10).split('/');
                                        fileName = fileName[fileName.length - 1];
                                        if (!fs.existsSync(path.join(dataDir + pathDir))) {
                                            // Make directories, will create intermediate directories if necessary, makes my life a shit ton easier
                                            shelljs.mkdir('-p', dataDir + pathDir);
                                        }
                                        JavaAssets.push(new Asset(fileName, null, javamanifest[key].downloads.raw.size, javamanifest[key].downloads.raw.url, path.join(dataDir + pathDir + fileName)));
                                        /*const filepath = fs.createWriteStream(path.join('.' + key.substring(10)))
                                        console.log(javamanifest[key].downloads.raw.url)
                                        const request = https.get(javamanifest[key].downloads.raw.url, function(response) {
                                            response.pipe(filepath)
                                        })*/
                                    }
                                    FileSizes = 0;
                                    JavaAssets.forEach(function (element) {
                                        FileSizes += element.size;
                                    });
                                    AssetSize = JavaAssets.length;
                                    CurExecTimes = 0;
                                    this.java = new DLTracker(JavaAssets, FileSizes, function (a, self) {
                                        child_process.execSync('chmod +x ' + '"' + a.to + '"');
                                        CurExecTimes += 1;
                                        if (CurExecTimes == AssetSize) {
                                            new Promise(function (resolve, reject) {
                                                setTimeout(function () {
                                                    self.emit('complete', 'java', JavaGuard.javaExecFromRoot(dataDir));
                                                    resolve();
                                                }, 1000); //Wait 1 second
                                            });
                                        }
                                    });
                                    resolve(true);
                                    return [2 /*return*/];
                            }
                        });
                    }); })();
                }
                catch (err) {
                    console.log('Error ' + err);
                }
            }
        });
    };
    // _enqueueOracleJRE(dataDir){
    //     return new Promise((resolve, reject) => {
    //         JavaGuard._latestJREOracle().then(verData => {
    //             if(verData != null){
    //                 const combined = verData.uri + PLATFORM_MAP[process.platform]
    //                 const opts = {
    //                     url: combined,
    //                     headers: {
    //                         'Cookie': 'oraclelicense=accept-securebackup-cookie'
    //                     }
    //                 }
    //                 request.head(opts, (err, resp, body) => {
    //                     if(err){
    //                         resolve(false)
    //                     } else {
    //                         dataDir = path.join(dataDir, 'runtime', 'x64')
    //                         const name = combined.substring(combined.lastIndexOf('/')+1)
    //                         const fDir = path.join(dataDir, name)
    //                         const jre = new Asset(name, null, parseInt(resp.headers['content-length']), opts, fDir)
    //                         this.java = new DLTracker([jre], jre.size, (a, self) => {
    //                             let h = null
    //                             fs.createReadStream(a.to)
    //                                 .on('error', err => console.log(err))
    //                                 .pipe(zlib.createGunzip())
    //                                 .on('error', err => console.log(err))
    //                                 .pipe(tar.extract(dataDir, {
    //                                     map: (header) => {
    //                                         if(h == null){
    //                                             h = header.name
    //                                         }
    //                                     }
    //                                 }))
    //                                 .on('error', err => console.log(err))
    //                                 .on('finish', () => {
    //                                     fs.unlink(a.to, err => {
    //                                         if(err){
    //                                             console.log(err)
    //                                         }
    //                                         if(h.indexOf('/') > -1){
    //                                             h = h.substring(0, h.indexOf('/'))
    //                                         }
    //                                         const pos = path.join(dataDir, h)
    //                                         self.emit('complete', 'java', JavaGuard.javaExecFromRoot(pos))
    //                                     })
    //                                 })
    //                         })
    //                         resolve(true)
    //                     }
    //                 })
    //             } else {
    //                 resolve(false)
    //             }
    //         })
    //     })
    // }
    // _enqueueMojangJRE(dir){
    //     return new Promise((resolve, reject) => {
    //         // Mojang does not host the JRE for linux.
    //         if(process.platform === 'linux'){
    //             resolve(false)
    //         }
    //         AssetGuard.loadMojangLauncherData().then(data => {
    //             if(data != null) {
    //                 try {
    //                     const mJRE = data[Library.mojangFriendlyOS()]['64'].jre
    //                     const url = mJRE.url
    //                     request.head(url, (err, resp, body) => {
    //                         if(err){
    //                             resolve(false)
    //                         } else {
    //                             const name = url.substring(url.lastIndexOf('/')+1)
    //                             const fDir = path.join(dir, name)
    //                             const jre = new Asset('jre' + mJRE.version, mJRE.sha1, resp.headers['content-length'], url, fDir)
    //                             this.java = new DLTracker([jre], jre.size, a => {
    //                                 fs.readFile(a.to, (err, data) => {
    //                                     // Data buffer needs to be decompressed from lzma,
    //                                     // not really possible using node.js
    //                                 })
    //                             })
    //                         }
    //                     })
    //                 } catch (err){
    //                     resolve(false)
    //                 }
    //             }
    //         })
    //     })
    // }
    // #endregion
    // #endregion
    // Control Flow Functions
    // #region
    /**
     * Initiate an async download process for an AssetGuard DLTracker.
     *
     * @param {string} identifier The identifier of the AssetGuard DLTracker.
     * @param {number} limit Optional. The number of async processes to run in parallel.
     * @returns {boolean} True if the process began, otherwise false.
     */
    AssetGuard.prototype.startAsyncProcess = function (identifier, limit) {
        var _this = this;
        if (limit === void 0) { limit = 5; }
        var self = this;
        var dlTracker = this[identifier];
        var dlQueue = dlTracker.dlqueue;
        if (dlQueue.length > 0) {
            console.log('DLQueue', dlQueue);
            async.eachLimit(dlQueue, limit, function (asset, cb) {
                fs.ensureDirSync(path.join(asset.to, '..'));
                var req = got.stream(asset.from, { throwHttpErrors: false });
                req.pause();
                req.on('response', function (resp) {
                    if (resp.statusCode === 200) {
                        var doHashCheck_1 = false;
                        var contentLength = parseInt(resp.headers['content-length']);
                        //console.log('INFO Checking content length of: ' + contentLength)
                        //contentLength = parseInt(contentLength)
                        if (contentLength !== asset.size) {
                            console.log("WARN: Got " + contentLength + " bytes for " + asset.id + ": Expected " + asset.size);
                            doHashCheck_1 = true;
                            // Adjust download
                            _this.totaldlsize -= parseInt(asset.size);
                            _this.totaldlsize += parseInt(contentLength);
                        }
                        var writeStream = fs.createWriteStream(asset.to);
                        writeStream.on('close', function () {
                            if (dlTracker.callback != null) {
                                dlTracker.callback.apply(dlTracker, [asset, self]);
                            }
                            if (doHashCheck_1) {
                                var v = AssetGuard._validateLocal(asset.to, asset.type != null ? 'md5' : 'sha1', asset.hash);
                                if (v) {
                                    console.log("Hashes match for " + asset.id + ", byte mismatch is an issue in the distro index.");
                                }
                                else {
                                    console.error("Hashes do not match, " + asset.id + " may be corrupted.");
                                }
                            }
                            cb();
                        });
                        req.pipe(writeStream);
                        req.resume();
                    }
                    else {
                        req.destroy();
                        console.log("Failed to download " + asset.id + "(" + (typeof asset.from === 'object' ? asset.from.url : asset.from) + "). Response code " + resp.statusCode);
                        self.progress += asset.size * 1;
                        self.emit('progress', 'download', self.progress, self.totaldlsize);
                        cb();
                    }
                });
                req.on('error', function (err) {
                    self.emit('error', 'download', err + ' Code: ' + req.RequestError);
                });
                req.on('data', function (chunk) {
                    self.progress += chunk.length;
                    self.emit('progress', 'download', self.progress, self.totaldlsize);
                });
            }, function (err) {
                if (err) {
                    console.log('An item in ' + identifier + ' failed to process');
                }
                else {
                    console.log('All ' + identifier + ' have been processed successfully');
                }
                //self.totaldlsize -= dlTracker.dlsize
                //self.progress -= dlTracker.dlsize
                self[identifier] = new DLTracker([], 0);
                if (self.progress >= self.totaldlsize) {
                    if (self.extractQueue.length > 0) {
                        self.emit('progress', 'extract', 1, 1);
                        //self.emit('extracting')
                        AssetGuard._extractPackXZ(self.extractQueue, self.javaexec).then(function () {
                            self.extractQueue = [];
                            self.emit('complete', 'download');
                        });
                    }
                    else {
                        self.emit('complete', 'download');
                    }
                }
            });
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * This function will initiate the download processed for the specified identifiers. If no argument is
     * given, all identifiers will be initiated. Note that in order for files to be processed you need to run
     * the processing function corresponding to that identifier. If you run this function without processing
     * the files, it is likely nothing will be enqueued in the object and processing will complete
     * immediately. Once all downloads are complete, this function will fire the 'complete' event on the
     * global object instance.
     *
     * @param {Array.<{id: string, limit: number}>} identifiers Optional. The identifiers to process and corresponding parallel async task limit.
     */
    AssetGuard.prototype.processDlQueues = function (identifiers) {
        var _this = this;
        if (identifiers === void 0) { identifiers = [{ id: 'assets', limit: 20 }, { id: 'libraries', limit: 5 }, { id: 'files', limit: 5 }, { id: 'forge', limit: 5 }]; }
        return new Promise(function (resolve, reject) {
            var shouldFire = true;
            // Assign dltracking variables.
            _this.totaldlsize = 0;
            _this.progress = 0;
            for (var _i = 0, identifiers_1 = identifiers; _i < identifiers_1.length; _i++) {
                var iden = identifiers_1[_i];
                _this.totaldlsize += _this[iden.id].dlsize;
            }
            _this.once('complete', function (data) {
                resolve();
            });
            for (var _a = 0, identifiers_2 = identifiers; _a < identifiers_2.length; _a++) {
                var iden = identifiers_2[_a];
                var r = _this.startAsyncProcess(iden.id, iden.limit);
                if (r)
                    shouldFire = false;
            }
            if (shouldFire) {
                _this.emit('complete', 'download');
            }
        });
    };
    AssetGuard.prototype.validateEverything = function (serverid, dev) {
        if (dev === void 0) { dev = false; }
        return __awaiter(this, void 0, void 0, function () {
            var dI, server, versionData_1, wasran, forgeData_2, err_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        if (!ConfigManager.isLoaded()) {
                            ConfigManager.load();
                        }
                        DistroManager.setDevMode(dev);
                        return [4 /*yield*/, DistroManager.pullLocal()];
                    case 1:
                        dI = _a.sent();
                        server = dI.getServer(serverid);
                        // Validate Everything
                        return [4 /*yield*/, this.validateDistribution(server)];
                    case 2:
                        // Validate Everything
                        _a.sent();
                        this.emit('validate', 'distribution');
                        return [4 /*yield*/, this.loadVersionData(server.getMinecraftVersion())];
                    case 3:
                        versionData_1 = _a.sent();
                        this.emit('validate', 'version');
                        return [4 /*yield*/, this.validateAssets(versionData_1)];
                    case 4:
                        _a.sent();
                        this.emit('validate', 'assets');
                        return [4 /*yield*/, this.validateLibraries(versionData_1)];
                    case 5:
                        wasran = _a.sent();
                        this.emit('validate', 'libraries');
                        if (!wasran) return [3 /*break*/, 8];
                        console.log('Downloading forge');
                        return [4 /*yield*/, fs.writeFile(ConfigManager.getCommonDirectory() + '/launcher_profiles.json', '{}')];
                    case 6:
                        _a.sent();
                        this.emit('validate', 'dlforge');
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var file = fs.createWriteStream(path.join(ConfigManager.getCommonDirectory() + '/sow-installer-31.2.31.jar'));
                                request({
                                    uri: 'https://mysql.songs-of-war.com/sow-installer-31.2.31.jar',
                                    headers: {
                                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                                        'Accept-Encoding': 'gzip, deflate, br',
                                        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
                                        'Cache-Control': 'max-age=0',
                                        'Connection': 'keep-alive',
                                        'Upgrade-Insecure-Requests': '1',
                                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
                                    },
                                    gzip: false
                                })
                                    .pipe(file)
                                    .on('finish', function () { return __awaiter(_this, void 0, void 0, function () {
                                    var jExe, launcharguments, forgeinstaller, buildforge2_1, forgemapping_1, forgepatching_1;
                                    var _this = this;
                                    return __generator(this, function (_a) {
                                        file.close();
                                        this.emit('validate', 'dlforgelibs');
                                        console.log('Downloaded forge');
                                        console.log('Starting install');
                                        jExe = ConfigManager.getJavaExecutable();
                                        if (jExe == null) {
                                            console.log('No java found');
                                            reject();
                                        }
                                        else {
                                            console.log('Installing forge');
                                            console.log('Executing: ' + path.join('"' + path.join(ConfigManager.getJavaExecutable() + '" -jar ' + '"' + ConfigManager.getCommonDirectory() + '/sow-installer-31.2.31.jar" --installClient "' + ConfigManager.getCommonDirectory() + '"')).toString());
                                            launcharguments = [
                                                '-jar',
                                                ConfigManager.getCommonDirectory() + '/sow-installer-31.2.31.jar',
                                                '-installClient',
                                                ConfigManager.getCommonDirectory()
                                            ];
                                            forgeinstaller = child_process.spawn(path.join(ConfigManager.getJavaExecutable()), launcharguments, {
                                                detached: false
                                            });
                                            forgeinstaller.stdout.setEncoding('utf-8');
                                            forgeinstaller.stderr.setEncoding('utf-8');
                                            buildforge2_1 = false;
                                            forgemapping_1 = false;
                                            forgepatching_1 = false;
                                            forgeinstaller.stdout.on('data', function (data) {
                                                console.log(data);
                                                if (data.startsWith('Building Processors')) {
                                                    _this.emit('validate', 'buildingforge');
                                                }
                                                if (data.startsWith('Data') && !buildforge2_1) {
                                                    buildforge2_1 = true;
                                                    _this.emit('validate', 'buildingforge2');
                                                }
                                                if (data.startsWith('Loading mappings') && !forgemapping_1) {
                                                    forgemapping_1 = true;
                                                    _this.emit('validate', 'forgeremap');
                                                }
                                                if (data.startsWith('Patches:') && !forgepatching_1) {
                                                    forgepatching_1 = true;
                                                    _this.emit('validate', 'forgepatch');
                                                }
                                            });
                                            forgeinstaller.stderr.on('data', function (data) {
                                                console.error(data);
                                            });
                                            forgeinstaller.on('exit', function (code, signal) {
                                                console.log('Forge installer exited with code ' + code);
                                            });
                                            forgeinstaller.on('error', function (err) {
                                                console.error(err);
                                            });
                                            forgeinstaller.on('close', function (code, signal) {
                                                resolve();
                                            });
                                        }
                                        return [2 /*return*/];
                                    });
                                }); });
                            })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [4 /*yield*/, this.validateMiscellaneous(versionData_1)];
                    case 9:
                        _a.sent();
                        this.emit('validate', 'files');
                        //this.emit('complete', 'download')
                        return [4 /*yield*/, this.processDlQueues()];
                    case 10:
                        //this.emit('complete', 'download')
                        _a.sent();
                        return [4 /*yield*/, this.loadForgeData(server)];
                    case 11:
                        forgeData_2 = _a.sent();
                        return [2 /*return*/, {
                                versionData: versionData_1,
                                forgeData: forgeData_2
                            }];
                    case 12:
                        err_2 = _a.sent();
                        console.error(err_2);
                        return [2 /*return*/, {
                                versionData: null,
                                forgeData: null,
                                error: err_2
                            }];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return AssetGuard;
}(EventEmitter));
module.exports = {
    Util: Util,
    AssetGuard: AssetGuard,
    JavaGuard: JavaGuard,
    Asset: Asset,
    Library: Library
};
