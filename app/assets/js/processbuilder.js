var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var AdmZip = require('adm-zip');
var child_process = require('child_process');
var crypto = require('crypto');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var URL = require('url').URL;
var _a = require('./assetguard'), Util = _a.Util, Library = _a.Library;
var ConfigManager = require('./configmanager');
var DistroManager = require('./distromanager');
var LoggerUtil = require('./loggerutil');
var DiscordWrapper = require('./discordwrapper');
var logger = LoggerUtil('%c[ProcessBuilder]', 'color: #003996; font-weight: bold');
var ProcessBuilder = /** @class */ (function () {
    function ProcessBuilder(distroServer, versionData, forgeData, authUser, launcherVersion) {
        this.gameDir = path.join(ConfigManager.getInstanceDirectory(), distroServer.getID());
        this.commonDir = ConfigManager.getCommonDirectory();
        this.server = distroServer;
        this.versionData = versionData;
        this.forgeData = forgeData;
        this.authUser = authUser;
        this.launcherVersion = launcherVersion;
        this.fmlDir = path.join(this.gameDir, 'forgeModList.json');
        this.llDir = path.join(this.gameDir, 'liteloaderModList.json');
        this.libPath = path.join(this.commonDir, 'libraries');
        this.usingLiteLoader = false;
        this.llPath = null;
    }
    /**
     * Convienence method to run the functions typically used to build a process.
     */
    ProcessBuilder.prototype.build = function () {
        fs.ensureDirSync(this.gameDir);
        var tempNativePath = path.join(os.tmpdir(), ConfigManager.getTempNativeFolder(), crypto.pseudoRandomBytes(16).toString('hex'));
        process.throwDeprecation = true;
        this.setupLiteLoader();
        logger.log('Using liteloader:', this.usingLiteLoader);
        var modObj = this.resolveModConfiguration(ConfigManager.getModConfiguration(this.server.getID()).mods, this.server.getModules());
        // Mod list below 1.13
        if (!Util.mcVersionAtLeast('1.13', this.server.getMinecraftVersion())) {
            this.constructModList('forge', modObj.fMods, true);
            if (this.usingLiteLoader) {
                this.constructModList('liteloader', modObj.lMods, true);
            }
        }
        var uberModArr = modObj.fMods.concat(modObj.lMods);
        var args = this.constructJVMArguments(uberModArr, tempNativePath);
        if (Util.mcVersionAtLeast('1.13', this.server.getMinecraftVersion())) {
            args = args.concat(this.constructModArguments(modObj.fMods));
        }
        logger.log('Launch Arguments:', args);
        var child = child_process.spawn(ConfigManager.getJavaExecutable(), args, {
            cwd: this.gameDir,
            detached: false,
        });
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        var loggerMCstdout = LoggerUtil('%c[Minecraft]', 'color: #36b030; font-weight: bold');
        var loggerMCstderr = LoggerUtil('%c[Minecraft]', 'color: #b03030; font-weight: bold');
        child.emit('message', 'GameStarted');
        var hasstoppednormally = false;
        child.stdout.on('data', function (data) {
            loggerMCstdout.log(data);
            if (data.includes('[Render thread/INFO]: Stopping!')) {
                hasstoppednormally = true;
            }
        });
        child.stderr.on('data', function (data) {
            loggerMCstderr.log(data);
        });
        child.on('close', function (code, signal) {
            // Update discord RPC and check if the game shuts down cleanly
            DiscordWrapper.updateDetails('In the Launcher', new Date().getTime());
            logger.log('Exited with code', code);
            child.emit('message', 'MinecraftShutdown');
            fs.remove(tempNativePath, function (err) {
                if (err) {
                    logger.warn('Error while deleting temp dir', err);
                }
                else {
                    logger.log('Temp dir deleted successfully.');
                }
            });
            if (!hasstoppednormally) {
                child.emit('message', 'Crashed');
            }
        });
        return child;
    };
    /**
     * Determine if an optional mod is enabled from its configuration value. If the
     * configuration value is null, the required object will be used to
     * determine if it is enabled.
     *
     * A mod is enabled if:
     *   * The configuration is not null and one of the following:
     *     * The configuration is a boolean and true.
     *     * The configuration is an object and its 'value' property is true.
     *   * The configuration is null and one of the following:
     *     * The required object is null.
     *     * The required object's 'def' property is null or true.
     *
     * @param {Object | boolean} modCfg The mod configuration object.
     * @param {Object} required Optional. The required object from the mod's distro declaration.
     * @returns {boolean} True if the mod is enabled, false otherwise.
     */
    ProcessBuilder.isModEnabled = function (modCfg, required) {
        if (required === void 0) { required = null; }
        return modCfg != null ? ((typeof modCfg === 'boolean' && modCfg) || (typeof modCfg === 'object' && (typeof modCfg.value !== 'undefined' ? modCfg.value : true))) : required != null ? required.isDefault() : true;
    };
    /**
     * Function which performs a preliminary scan of the top level
     * mods. If liteloader is present here, we setup the special liteloader
     * launch options. Note that liteloader is only allowed as a top level
     * mod. It must not be declared as a submodule.
     */
    ProcessBuilder.prototype.setupLiteLoader = function () {
        for (var _i = 0, _a = this.server.getModules(); _i < _a.length; _i++) {
            var ll = _a[_i];
            if (ll.getType() === DistroManager.Types.LiteLoader) {
                if (!ll.getRequired().isRequired()) {
                    var modCfg = ConfigManager.getModConfiguration(this.server.getID()).mods;
                    if (ProcessBuilder.isModEnabled(modCfg[ll.getVersionlessID()], ll.getRequired())) {
                        if (fs.existsSync(ll.getArtifact().getPath())) {
                            this.usingLiteLoader = true;
                            this.llPath = ll.getArtifact().getPath();
                        }
                    }
                }
                else {
                    if (fs.existsSync(ll.getArtifact().getPath())) {
                        this.usingLiteLoader = true;
                        this.llPath = ll.getArtifact().getPath();
                    }
                }
            }
        }
    };
    /**
     * Resolve an array of all enabled mods. These mods will be constructed into
     * a mod list format and enabled at launch.
     *
     * @param {Object} modCfg The mod configuration object.
     * @param {Array.<Object>} mdls An array of modules to parse.
     * @returns {{fMods: Array.<Object>, lMods: Array.<Object>}} An object which contains
     * a list of enabled forge mods and litemods.
     */
    ProcessBuilder.prototype.resolveModConfiguration = function (modCfg, mdls) {
        var fMods = [];
        var lMods = [];
        for (var _i = 0, mdls_1 = mdls; _i < mdls_1.length; _i++) {
            var mdl = mdls_1[_i];
            var type = mdl.getType();
            if (type === DistroManager.Types.ForgeMod || type === DistroManager.Types.LiteMod || type === DistroManager.Types.LiteLoader) {
                var o = !mdl.getRequired().isRequired();
                var e = ProcessBuilder.isModEnabled(modCfg[mdl.getVersionlessID()], mdl.getRequired());
                if (!o || (o && e)) {
                    if (mdl.hasSubModules()) {
                        var v = this.resolveModConfiguration(modCfg[mdl.getVersionlessID()].mods, mdl.getSubModules());
                        fMods = fMods.concat(v.fMods);
                        lMods = lMods.concat(v.lMods);
                        if (mdl.type === DistroManager.Types.LiteLoader) {
                            continue;
                        }
                    }
                    if (mdl.type === DistroManager.Types.ForgeMod) {
                        fMods.push(mdl);
                    }
                    else {
                        lMods.push(mdl);
                    }
                }
            }
        }
        return {
            fMods: fMods,
            lMods: lMods
        };
    };
    ProcessBuilder.prototype._lteMinorVersion = function (version) {
        return Number(this.forgeData.id.split('-')[0].split('.')[1]) <= Number(version);
    };
    /**
     * Test to see if this version of forge requires the absolute: prefix
     * on the modListFile repository field.
     */
    ProcessBuilder.prototype._requiresAbsolute = function () {
        try {
            if (this._lteMinorVersion(9)) {
                return false;
            }
            var ver = this.forgeData.id.split('-')[2];
            var pts = ver.split('.');
            var min = [14, 23, 3, 2655];
            for (var i = 0; i < pts.length; i++) {
                var parsed = Number.parseInt(pts[i]);
                if (parsed < min[i]) {
                    return false;
                }
                else if (parsed > min[i]) {
                    return true;
                }
            }
        }
        catch (err) {
            // We know old forge versions follow this format.
            // Error must be caused by newer version.
        }
        // Equal or errored
        return true;
    };
    /**
     * Construct a mod list json object.
     *
     * @param {'forge' | 'liteloader'} type The mod list type to construct.
     * @param {Array.<Object>} mods An array of mods to add to the mod list.
     * @param {boolean} save Optional. Whether or not we should save the mod list file.
     */
    ProcessBuilder.prototype.constructModList = function (type, mods, save) {
        if (save === void 0) { save = false; }
        var modList = {
            repositoryRoot: ((type === 'forge' && this._requiresAbsolute()) ? 'absolute:' : '') + path.join(this.commonDir, 'modstore')
        };
        var ids = [];
        if (type === 'forge') {
            for (var _i = 0, mods_1 = mods; _i < mods_1.length; _i++) {
                var mod = mods_1[_i];
                ids.push(mod.getExtensionlessID());
            }
        }
        else {
            for (var _a = 0, mods_2 = mods; _a < mods_2.length; _a++) {
                var mod = mods_2[_a];
                ids.push(mod.getExtensionlessID() + '@' + mod.getExtension());
            }
        }
        modList.modRef = ids;
        if (save) {
            var json = JSON.stringify(modList, null, 4);
            fs.writeFileSync(type === 'forge' ? this.fmlDir : this.llDir, json, 'UTF-8');
        }
        return modList;
    };
    /**
     * Construct the mod argument list for forge 1.13
     *
     * @param {Array.<Object>} mods An array of mods to add to the mod list.
     */
    ProcessBuilder.prototype.constructModArguments = function (mods) {
        var argStr = mods.map(function (mod) {
            return mod.getExtensionlessID();
        }).join(',');
        if (argStr) {
            return [
                '--fml.mavenRoots',
                path.join('..', '..', 'common', 'modstore'),
                '--fml.mods',
                argStr
            ];
        }
        else {
            return [];
        }
    };
    ProcessBuilder.prototype._processAutoConnectArg = function (args) {
        if (ConfigManager.getAutoConnect() && this.server.isAutoConnect()) {
            var serverURL = new URL('my://' + this.server.getAddress());
            args.push('--server');
            args.push(serverURL.hostname);
            if (serverURL.port) {
                args.push('--port');
                args.push(serverURL.port);
            }
        }
    };
    /**
     * Construct the argument array that will be passed to the JVM process.
     *
     * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
     * @param {string} tempNativePath The path to store the native libraries.
     * @returns {Array.<string>} An array containing the full JVM arguments for this process.
     */
    ProcessBuilder.prototype.constructJVMArguments = function (mods, tempNativePath) {
        if (Util.mcVersionAtLeast('1.13', this.server.getMinecraftVersion())) {
            return this._constructJVMArguments113(mods, tempNativePath);
        }
        else {
            return this._constructJVMArguments112(mods, tempNativePath);
        }
    };
    /**
     * Construct the argument array that will be passed to the JVM process.
     * This function is for 1.12 and below.
     *
     * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
     * @param {string} tempNativePath The path to store the native libraries.
     * @returns {Array.<string>} An array containing the full JVM arguments for this process.
     */
    ProcessBuilder.prototype._constructJVMArguments112 = function (mods, tempNativePath) {
        var args = [];
        // Classpath Argument
        args.push('-cp');
        args.push(this.classpathArg(mods, tempNativePath).join(process.platform === 'win32' ? ';' : ':'));
        // Java Arguments
        if (process.platform === 'darwin') {
            args.push('-Xdock:name=SoWLauncher');
            args.push('-Xdock:icon=' + path.join(__dirname, '..', 'images', 'minecraft.icns'));
        }
        args.push('-Xmx' + ConfigManager.getMaxRAM());
        args.push('-Xms' + ConfigManager.getMinRAM());
        args = args.concat(ConfigManager.getJVMOptions());
        args.push('-Djava.library.path=' + tempNativePath);
        // Main Java Class
        args.push(this.forgeData.mainClass);
        // Forge Arguments
        args = args.concat(this._resolveForgeArgs());
        return args;
    };
    /**
     * Construct the argument array that will be passed to the JVM process.
     * This function is for 1.13+
     *
     * Note: Required Libs https://github.com/MinecraftForge/MinecraftForge/blob/af98088d04186452cb364280340124dfd4766a5c/src/fmllauncher/java/net/minecraftforge/fml/loading/LibraryFinder.java#L82
     *
     * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
     * @param {string} tempNativePath The path to store the native libraries.
     * @returns {Array.<string>} An array containing the full JVM arguments for this process.
     */
    ProcessBuilder.prototype._constructJVMArguments113 = function (mods, tempNativePath) {
        var argDiscovery = /\${*(.*)}/;
        // JVM Arguments First
        var args = this.versionData.arguments.jvm;
        // Java Arguments
        if (process.platform === 'darwin') {
            args.push('-Xdock:name=SoWLauncher');
            args.push('-Xdock:icon=' + path.join(__dirname, '..', 'images', 'minecraft.icns'));
        }
        args.push('-Xmx' + ConfigManager.getMaxRAM());
        args.push('-Xms' + ConfigManager.getMinRAM());
        args = args.concat(ConfigManager.getJVMOptions());
        // Main Java Class
        args.push(this.forgeData.mainClass);
        // Vanilla Arguments
        args = args.concat(this.versionData.arguments.game);
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] === 'object' && args[i].rules != null) {
                var checksum = 0;
                for (var _i = 0, _a = args[i].rules; _i < _a.length; _i++) {
                    var rule = _a[_i];
                    if (rule.os != null) {
                        if (rule.os.name === Library.mojangFriendlyOS()
                            && (rule.os.version == null || new RegExp(rule.os.version).test(os.release))) {
                            if (rule.action === 'allow') {
                                checksum++;
                            }
                        }
                        else {
                            if (rule.action === 'disallow') {
                                checksum++;
                            }
                        }
                    }
                    else if (rule.features != null) {
                        // We don't have many 'features' in the index at the moment.
                        // This should be fine for a while.
                        if (rule.features.has_custom_resolution != null && rule.features.has_custom_resolution === true) {
                            if (ConfigManager.getFullscreen()) {
                                args[i].value = [
                                    '--fullscreen',
                                    'true'
                                ];
                            }
                            checksum++;
                        }
                    }
                }
                // TODO splice not push
                if (checksum === args[i].rules.length) {
                    if (typeof args[i].value === 'string') {
                        args[i] = args[i].value;
                    }
                    else if (typeof args[i].value === 'object') {
                        //args = args.concat(args[i].value)
                        args.splice.apply(args, __spreadArrays([i, 1], args[i].value));
                    }
                    // Decrement i to reprocess the resolved value
                    i--;
                }
                else {
                    args[i] = null;
                }
            }
            else if (typeof args[i] === 'string') {
                if (argDiscovery.test(args[i])) {
                    var identifier = args[i].match(argDiscovery)[1];
                    var val = null;
                    switch (identifier) {
                        case 'auth_player_name':
                            val = this.authUser.displayName.trim();
                            break;
                        case 'version_name':
                            //val = versionData.id
                            val = this.server.getID();
                            break;
                        case 'game_directory':
                            val = this.gameDir;
                            break;
                        case 'assets_root':
                            val = path.join(this.commonDir, 'assets');
                            break;
                        case 'assets_index_name':
                            val = this.versionData.assets;
                            break;
                        case 'auth_uuid':
                            val = this.authUser.uuid.trim();
                            break;
                        case 'auth_access_token':
                            val = this.authUser.accessToken;
                            break;
                        case 'user_type':
                            val = 'mojang';
                            break;
                        case 'version_type':
                            val = this.versionData.type;
                            break;
                        case 'resolution_width':
                            val = ConfigManager.getGameWidth();
                            break;
                        case 'resolution_height':
                            val = ConfigManager.getGameHeight();
                            break;
                        case 'natives_directory':
                            val = args[i].replace(argDiscovery, tempNativePath);
                            break;
                        case 'launcher_name':
                            val = args[i].replace(argDiscovery, 'SoW-Launcher');
                            break;
                        case 'launcher_version':
                            val = args[i].replace(argDiscovery, this.launcherVersion);
                            break;
                        case 'classpath':
                            val = this.classpathArg(mods, tempNativePath).join(process.platform === 'win32' ? ';' : ':');
                            break;
                    }
                    if (val != null) {
                        args[i] = val;
                    }
                }
            }
        }
        // Autoconnect
        var isAutoconnectBroken;
        try {
            isAutoconnectBroken = Util.isAutoconnectBroken(this.forgeData.id.split('-')[2]);
        }
        catch (err) {
            logger.error(err);
            logger.error('Forge version format changed.. assuming autoconnect works.');
            logger.debug('Forge version:', this.forgeData.id);
        }
        if (isAutoconnectBroken) {
            logger.error('Server autoconnect disabled on Forge 1.15.2 for builds earlier than 31.2.15 due to OpenGL Stack Overflow issue.');
            logger.error('Please upgrade your Forge version to at least 31.2.15!');
        }
        else {
            this._processAutoConnectArg(args);
        }
        // Forge Specific Arguments
        args = args.concat(this.forgeData.arguments.game);
        // Filter null values
        args = args.filter(function (arg) {
            return arg != null;
        });
        return args;
    };
    /**
     * Resolve the arguments required by forge.
     *
     * @returns {Array.<string>} An array containing the arguments required by forge.
     */
    ProcessBuilder.prototype._resolveForgeArgs = function () {
        var mcArgs = this.forgeData.minecraftArguments.split(' ');
        var argDiscovery = /\${*(.*)}/;
        // Replace the declared variables with their proper values.
        for (var i = 0; i < mcArgs.length; ++i) {
            if (argDiscovery.test(mcArgs[i])) {
                var identifier = mcArgs[i].match(argDiscovery)[1];
                var val = null;
                switch (identifier) {
                    case 'auth_player_name':
                        val = this.authUser.displayName.trim();
                        break;
                    case 'version_name':
                        //val = versionData.id
                        val = this.server.getID();
                        break;
                    case 'game_directory':
                        val = this.gameDir;
                        break;
                    case 'assets_root':
                        val = path.join(this.commonDir, 'assets');
                        break;
                    case 'assets_index_name':
                        val = this.versionData.assets;
                        break;
                    case 'auth_uuid':
                        val = this.authUser.uuid.trim();
                        break;
                    case 'auth_access_token':
                        val = this.authUser.accessToken;
                        break;
                    case 'user_type':
                        val = 'mojang';
                        break;
                    case 'user_properties': // 1.8.9 and below.
                        val = '{}';
                        break;
                    case 'version_type':
                        val = this.versionData.type;
                        break;
                }
                if (val != null) {
                    mcArgs[i] = val;
                }
            }
        }
        // Autoconnect to the selected server.
        this._processAutoConnectArg(mcArgs);
        // Prepare game resolution
        if (ConfigManager.getFullscreen()) {
            mcArgs.push('--fullscreen');
            mcArgs.push(true);
        }
        else {
            mcArgs.push('--width');
            mcArgs.push(ConfigManager.getGameWidth());
            mcArgs.push('--height');
            mcArgs.push(ConfigManager.getGameHeight());
        }
        // Mod List File Argument
        mcArgs.push('--modListFile');
        if (this._lteMinorVersion(9)) {
            mcArgs.push(path.basename(this.fmlDir));
        }
        else {
            mcArgs.push('absolute:' + this.fmlDir);
        }
        // LiteLoader
        if (this.usingLiteLoader) {
            mcArgs.push('--modRepo');
            mcArgs.push(this.llDir);
            // Set first arg to liteloader tweak class
            mcArgs.unshift('com.mumfrey.liteloader.launch.LiteLoaderTweaker');
            mcArgs.unshift('--tweakClass');
        }
        return mcArgs;
    };
    /**
     * Ensure that the classpath entries all point to jar files.
     *
     * @param {Array.<String>} list Array of classpath entries.
     */
    ProcessBuilder.prototype._processClassPathList = function (list) {
        var ext = '.jar';
        var extLen = ext.length;
        for (var i = 0; i < list.length; i++) {
            var extIndex = list[i].indexOf(ext);
            if (extIndex > -1 && extIndex !== list[i].length - extLen) {
                list[i] = list[i].substring(0, extIndex + extLen);
            }
        }
    };
    /**
     * Resolve the full classpath argument list for this process. This method will resolve all Mojang-declared
     * libraries as well as the libraries declared by the server. Since mods are permitted to declare libraries,
     * this method requires all enabled mods as an input
     *
     * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
     * @param {string} tempNativePath The path to store the native libraries.
     * @returns {Array.<string>} An array containing the paths of each library required by this process.
     */
    ProcessBuilder.prototype.classpathArg = function (mods, tempNativePath) {
        var cpArgs = [];
        // Add the version.jar to the classpath.
        var version = this.versionData.id;
        cpArgs.push(path.join(this.commonDir, 'versions', version, version + '.jar'));
        if (this.usingLiteLoader) {
            cpArgs.push(this.llPath);
        }
        // Resolve the Mojang declared libraries.
        var mojangLibs = this._resolveMojangLibraries(tempNativePath);
        // Resolve the server declared libraries.
        var servLibs = this._resolveServerLibraries(mods);
        // Merge libraries, server libs with the same
        // maven identifier will override the mojang ones.
        // Ex. 1.7.10 forge overrides mojang's guava with newer version.
        var finalLibs = __assign(__assign({}, mojangLibs), servLibs);
        cpArgs = cpArgs.concat(Object.values(finalLibs));
        this._processClassPathList(cpArgs);
        return cpArgs;
    };
    /**
     * Resolve the libraries defined by Mojang's version data. This method will also extract
     * native libraries and point to the correct location for its classpath.
     *
     * TODO - clean up function
     *
     * @param {string} tempNativePath The path to store the native libraries.
     * @returns {{[id: string]: string}} An object containing the paths of each library mojang declares.
     */
    ProcessBuilder.prototype._resolveMojangLibraries = function (tempNativePath) {
        var libs = {};
        var libArr = this.versionData.libraries;
        fs.ensureDirSync(tempNativePath);
        for (var i = 0; i < libArr.length; i++) {
            var lib = libArr[i];
            if (Library.validateRules(lib.rules, lib.natives)) {
                if (lib.natives == null) {
                    var dlInfo = lib.downloads;
                    var artifact = dlInfo.artifact;
                    var to = path.join(this.libPath, artifact.path);
                    var versionIndependentId = lib.name.substring(0, lib.name.lastIndexOf(':'));
                    libs[versionIndependentId] = to;
                }
                else {
                    // Extract the native library.
                    var exclusionArr = lib.extract != null ? lib.extract.exclude : ['META-INF/'];
                    var artifact = lib.downloads.classifiers[lib.natives[Library.mojangFriendlyOS()].replace('${arch}', process.arch.replace('x', ''))];
                    // Location of native zip.
                    var to = path.join(this.libPath, artifact.path);
                    var zip = new AdmZip(to);
                    var zipEntries = zip.getEntries();
                    var _loop_1 = function (i_1) {
                        var fileName = zipEntries[i_1].entryName;
                        var shouldExclude = false;
                        // Exclude noted files.
                        exclusionArr.forEach(function (exclusion) {
                            if (fileName.indexOf(exclusion) > -1) {
                                shouldExclude = true;
                            }
                        });
                        // Extract the file.
                        if (!shouldExclude) {
                            fs.writeFile(path.join(tempNativePath, fileName), zipEntries[i_1].getData(), function (err) {
                                if (err) {
                                    logger.error('Error while extracting native library:', err);
                                }
                            });
                        }
                    };
                    // Unzip the native zip.
                    for (var i_1 = 0; i_1 < zipEntries.length; i_1++) {
                        _loop_1(i_1);
                    }
                }
            }
        }
        return libs;
    };
    /**
     * Resolve the libraries declared by this server in order to add them to the classpath.
     * This method will also check each enabled mod for libraries, as mods are permitted to
     * declare libraries.
     *
     * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
     * @returns {{[id: string]: string}} An object containing the paths of each library this server requires.
     */
    ProcessBuilder.prototype._resolveServerLibraries = function (mods) {
        var mdls = this.server.getModules();
        var libs = {};
        // Locate Forge/Libraries
        for (var _i = 0, mdls_2 = mdls; _i < mdls_2.length; _i++) {
            var mdl = mdls_2[_i];
            var type = mdl.getType();
            if (type === DistroManager.Types.ForgeHosted || type === DistroManager.Types.Library) {
                libs[mdl.getVersionlessID()] = mdl.getArtifact().getPath();
                if (mdl.hasSubModules()) {
                    var res = this._resolveModuleLibraries(mdl);
                    if (res.length > 0) {
                        libs = __assign(__assign({}, libs), res);
                    }
                }
            }
        }
        //Check for any libraries in our mod list.
        for (var i = 0; i < mods.length; i++) {
            if (mods.sub_modules != null) {
                var res = this._resolveModuleLibraries(mods[i]);
                if (res.length > 0) {
                    libs = __assign(__assign({}, libs), res);
                }
            }
        }
        return libs;
    };
    /**
     * Recursively resolve the path of each library required by this module.
     *
     * @param {Object} mdl A module object from the server distro index.
     * @returns {Array.<string>} An array containing the paths of each library this module requires.
     */
    ProcessBuilder.prototype._resolveModuleLibraries = function (mdl) {
        if (!mdl.hasSubModules()) {
            return [];
        }
        var libs = [];
        for (var _i = 0, _a = mdl.getSubModules(); _i < _a.length; _i++) {
            var sm = _a[_i];
            if (sm.getType() === DistroManager.Types.Library) {
                libs.push(sm.getArtifact().getPath());
            }
            // If this module has submodules, we need to resolve the libraries for those.
            // To avoid unnecessary recursive calls, base case is checked here.
            if (mdl.hasSubModules()) {
                var res = this._resolveModuleLibraries(sm);
                if (res.length > 0) {
                    libs = libs.concat(res);
                }
            }
        }
        return libs;
    };
    return ProcessBuilder;
}());
module.exports = ProcessBuilder;
