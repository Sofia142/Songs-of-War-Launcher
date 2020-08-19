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
/**
 * Initialize UI functions which depend on internal modules.
 * Loaded after core UI functions are initialized in uicore.js.
 */
// Requirements
var path = require('path');
var AuthManager = require('./assets/js/authmanager');
var ConfigManager = require('./assets/js/configmanager');
var DistroManager = require('./assets/js/distromanager');
var Lang = require('./assets/js/langloader');
var rscShouldLoad = false;
var fatalStartupError = false;
// Mapping of each view to their container IDs.
var VIEWS = {
    landing: '#landingContainer',
    login: '#loginContainer',
    settings: '#settingsContainer',
    welcome: '#welcomeContainer'
};
// The currently shown view container.
var currentView;
/**
 * Switch launcher views.
 *
 * @param {string} current The ID of the current view container.
 * @param {*} next The ID of the next view container.
 * @param {*} currentFadeTime Optional. The fade out time for the current view.
 * @param {*} nextFadeTime Optional. The fade in time for the next view.
 * @param {*} onCurrentFade Optional. Callback function to execute when the current
 * view fades out.
 * @param {*} onNextFade Optional. Callback function to execute when the next view
 * fades in.
 */
function switchView(current, next, currentFadeTime, nextFadeTime, onCurrentFade, onNextFade) {
    if (currentFadeTime === void 0) { currentFadeTime = 500; }
    if (nextFadeTime === void 0) { nextFadeTime = 500; }
    if (onCurrentFade === void 0) { onCurrentFade = function () { }; }
    if (onNextFade === void 0) { onNextFade = function () { }; }
    currentView = next;
    $("" + current).fadeOut(currentFadeTime, function () {
        onCurrentFade();
        $("" + next).fadeIn(nextFadeTime, function () {
            onNextFade();
        });
    });
}
/**
 * Get the currently shown view container.
 *
 * @returns {string} The currently shown view container.
 */
function getCurrentView() {
    return currentView;
}
function showMainUI(data) {
    if (!isDev) {
        loggerAutoUpdater.log('Initializing..');
        ipcRenderer.send('autoUpdateAction', 'initAutoUpdater', false);
    }
    prepareSettings(true);
    updateSelectedServer(data.getServer(ConfigManager.getSelectedServer()));
    refreshServerStatus();
    setTimeout(function () {
        document.getElementById('frameBar').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.style.backgroundImage = "url('assets/images/backgrounds/" + document.body.getAttribute('bkid') + ".png')";
        $('#main').show();
        var isLoggedIn = Object.keys(ConfigManager.getAuthAccounts()).length > 0;
        // If this is enabled in a development environment we'll get ratelimited.
        // The relaunch frequency is usually far too high.
        if (!isDev && isLoggedIn) {
            validateSelectedAccount();
        }
        if (ConfigManager.isFirstLaunch()) {
            currentView = VIEWS.welcome;
            $(VIEWS.welcome).fadeIn(1000);
        }
        else {
            if (isLoggedIn) {
                currentView = VIEWS.landing;
                $(VIEWS.landing).fadeIn(1000);
            }
            else {
                currentView = VIEWS.login;
                $(VIEWS.login).fadeIn(1000);
            }
        }
        setTimeout(function () {
            $('#loadingContainer').fadeOut(500, function () {
                $('#loadSpinnerImage').removeClass('rotating');
            });
        }, 250);
    }, 750);
    // Disable tabbing to the news container.
    /*initNews().then(() => {
        $('#newsContainer *').attr('tabindex', '-1')
    })*/ //Remove news
}
function showFatalStartupError() {
    setTimeout(function () {
        $('#loadingContainer').fadeOut(250, function () {
            document.getElementById('overlayContainer').style.background = 'none';
            setOverlayContent('Fatal Error: Unable to Load Distribution Index', 'A connection could not be established to our servers to download the distribution index. <br><br>The distribution index is an essential file which provides the latest server information. The launcher is unable to start without it. Ensure you are connected to the internet and relaunch the application.', 'Close');
            setOverlayHandler(function () {
                var window = remote.getCurrentWindow();
                window.close();
            });
            toggleOverlay(true);
        });
    }, 750);
}
function showFatalStartupErrorServerMaintenance() {
    setTimeout(function () {
        $('#loadingContainer').fadeOut(250, function () {
            document.getElementById('overlayContainer').style.background = 'none';
            setOverlayContent('Fatal Error: Server in maintenance', 'Our data server is currently in maintenance.\nLikely because of an update.\nPlease try again later.', 'Close');
            setOverlayHandler(function () {
                var window = remote.getCurrentWindow();
                window.close();
            });
            toggleOverlay(true);
        });
    }, 750);
}
/**
 * Common functions to perform after refreshing the distro index.
 *
 * @param {Object} data The distro index object.
 */
function onDistroRefresh(data) {
    updateSelectedServer(data.getServer(ConfigManager.getSelectedServer()));
    refreshServerStatus();
    //initNews() We have no news here
    syncModConfigurations(data);
}
/**
 * Sync the mod configurations with the distro index.
 *
 * @param {Object} data The distro index object.
 */
function syncModConfigurations(data) {
    var syncedCfgs = [];
    for (var _i = 0, _a = data.getServers(); _i < _a.length; _i++) {
        var serv_1 = _a[_i];
        var id = serv_1.getID();
        var mdls = serv_1.getModules();
        var cfg = ConfigManager.getModConfiguration(id);
        if (cfg != null) {
            var modsOld = cfg.mods;
            var mods = {};
            for (var _b = 0, mdls_1 = mdls; _b < mdls_1.length; _b++) {
                var mdl = mdls_1[_b];
                var type = mdl.getType();
                if (type === DistroManager.Types.ForgeMod || type === DistroManager.Types.LiteMod || type === DistroManager.Types.LiteLoader) {
                    if (!mdl.getRequired().isRequired()) {
                        var mdlID = mdl.getVersionlessID();
                        if (modsOld[mdlID] == null) {
                            mods[mdlID] = scanOptionalSubModules(mdl.getSubModules(), mdl);
                        }
                        else {
                            mods[mdlID] = mergeModConfiguration(modsOld[mdlID], scanOptionalSubModules(mdl.getSubModules(), mdl), false);
                        }
                    }
                    else {
                        if (mdl.hasSubModules()) {
                            var mdlID = mdl.getVersionlessID();
                            var v = scanOptionalSubModules(mdl.getSubModules(), mdl);
                            if (typeof v === 'object') {
                                if (modsOld[mdlID] == null) {
                                    mods[mdlID] = v;
                                }
                                else {
                                    mods[mdlID] = mergeModConfiguration(modsOld[mdlID], v, true);
                                }
                            }
                        }
                    }
                }
            }
            syncedCfgs.push({
                id: id,
                mods: mods
            });
        }
        else {
            var mods = {};
            for (var _c = 0, mdls_2 = mdls; _c < mdls_2.length; _c++) {
                var mdl = mdls_2[_c];
                var type = mdl.getType();
                if (type === DistroManager.Types.ForgeMod || type === DistroManager.Types.LiteMod || type === DistroManager.Types.LiteLoader) {
                    if (!mdl.getRequired().isRequired()) {
                        mods[mdl.getVersionlessID()] = scanOptionalSubModules(mdl.getSubModules(), mdl);
                    }
                    else {
                        if (mdl.hasSubModules()) {
                            var v = scanOptionalSubModules(mdl.getSubModules(), mdl);
                            if (typeof v === 'object') {
                                mods[mdl.getVersionlessID()] = v;
                            }
                        }
                    }
                }
            }
            syncedCfgs.push({
                id: id,
                mods: mods
            });
        }
    }
    ConfigManager.setModConfigurations(syncedCfgs);
    ConfigManager.save();
}
/**
 * Recursively scan for optional sub modules. If none are found,
 * this function returns a boolean. If optional sub modules do exist,
 * a recursive configuration object is returned.
 *
 * @returns {boolean | Object} The resolved mod configuration.
 */
function scanOptionalSubModules(mdls, origin) {
    if (mdls != null) {
        var mods = {};
        for (var _i = 0, mdls_3 = mdls; _i < mdls_3.length; _i++) {
            var mdl = mdls_3[_i];
            var type = mdl.getType();
            // Optional types.
            if (type === DistroManager.Types.ForgeMod || type === DistroManager.Types.LiteMod || type === DistroManager.Types.LiteLoader) {
                // It is optional.
                if (!mdl.getRequired().isRequired()) {
                    mods[mdl.getVersionlessID()] = scanOptionalSubModules(mdl.getSubModules(), mdl);
                }
                else {
                    if (mdl.hasSubModules()) {
                        var v = scanOptionalSubModules(mdl.getSubModules(), mdl);
                        if (typeof v === 'object') {
                            mods[mdl.getVersionlessID()] = v;
                        }
                    }
                }
            }
        }
        if (Object.keys(mods).length > 0) {
            var ret = {
                mods: mods
            };
            if (!origin.getRequired().isRequired()) {
                ret.value = origin.getRequired().isDefault();
            }
            return ret;
        }
    }
    return origin.getRequired().isDefault();
}
/**
 * Recursively merge an old configuration into a new configuration.
 *
 * @param {boolean | Object} o The old configuration value.
 * @param {boolean | Object} n The new configuration value.
 * @param {boolean} nReq If the new value is a required mod.
 *
 * @returns {boolean | Object} The merged configuration.
 */
function mergeModConfiguration(o, n, nReq) {
    if (nReq === void 0) { nReq = false; }
    if (typeof o === 'boolean') {
        if (typeof n === 'boolean')
            return o;
        else if (typeof n === 'object') {
            if (!nReq) {
                n.value = o;
            }
            return n;
        }
    }
    else if (typeof o === 'object') {
        if (typeof n === 'boolean')
            return typeof o.value !== 'undefined' ? o.value : true;
        else if (typeof n === 'object') {
            if (!nReq) {
                n.value = typeof o.value !== 'undefined' ? o.value : true;
            }
            var newMods = Object.keys(n.mods);
            for (var i = 0; i < newMods.length; i++) {
                var mod = newMods[i];
                if (o.mods[mod] != null) {
                    n.mods[mod] = mergeModConfiguration(o.mods[mod], n.mods[mod]);
                }
            }
            return n;
        }
    }
    // If for some reason we haven't been able to merge,
    // wipe the old value and use the new one. Just to be safe
    return n;
}
function refreshDistributionIndex(remote, onSuccess, onError) {
    if (remote) {
        DistroManager.pullRemote()
            .then(onSuccess)
            .catch(onError);
    }
    else {
        DistroManager.pullLocal()
            .then(onSuccess)
            .catch(onError);
    }
}
function validateSelectedAccount() {
    return __awaiter(this, void 0, void 0, function () {
        var selectedAcc, val, accLen_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    selectedAcc = ConfigManager.getSelectedAccount();
                    if (!(selectedAcc != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, AuthManager.validateSelected()];
                case 1:
                    val = _a.sent();
                    if (!val) {
                        ConfigManager.removeAuthAccount(selectedAcc.uuid);
                        ConfigManager.save();
                        accLen_1 = Object.keys(ConfigManager.getAuthAccounts()).length;
                        setOverlayContent('Failed to Refresh Login', "We were unable to refresh the login for <strong>" + selectedAcc.displayName + "</strong>. Please " + (accLen_1 > 0 ? 'select another account or ' : '') + " login again.", 'Login', 'Select Another Account');
                        setOverlayHandler(function () {
                            document.getElementById('loginUsername').value = selectedAcc.username;
                            validateEmail(selectedAcc.username);
                            loginViewOnSuccess = getCurrentView();
                            loginViewOnCancel = getCurrentView();
                            if (accLen_1 > 0) {
                                loginViewCancelHandler = function () {
                                    ConfigManager.addAuthAccount(selectedAcc.uuid, selectedAcc.accessToken, selectedAcc.username, selectedAcc.displayName);
                                    ConfigManager.save();
                                    validateSelectedAccount();
                                };
                                loginCancelEnabled(true);
                            }
                            toggleOverlay(false);
                            switchView(getCurrentView(), VIEWS.login);
                        });
                        setDismissHandler(function () {
                            if (accLen_1 > 1) {
                                prepareAccountSelectionList();
                                $('#overlayContent').fadeOut(250, function () {
                                    bindOverlayKeys(true, 'accountSelectContent', true);
                                    $('#accountSelectContent').fadeIn(250);
                                });
                            }
                            else {
                                var accountsObj_1 = ConfigManager.getAuthAccounts();
                                var accounts = Array.from(Object.keys(accountsObj_1), function (v) { return accountsObj_1[v]; });
                                // This function validates the account switch.
                                setSelectedAccount(accounts[0].uuid);
                                toggleOverlay(false);
                            }
                        });
                        toggleOverlay(true, accLen_1 > 0);
                    }
                    else {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 3];
                case 2: return [2 /*return*/, true];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Temporary function to update the selected account along
 * with the relevent UI elements.
 *
 * @param {string} uuid The UUID of the account.
 */
function setSelectedAccount(uuid) {
    var authAcc = ConfigManager.setSelectedAccount(uuid);
    ConfigManager.save();
    updateSelectedAccount(authAcc);
    validateSelectedAccount();
}
// Synchronous Listener
document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        if (rscShouldLoad) {
            rscShouldLoad = false;
            if (!fatalStartupError) {
                var data_1 = DistroManager.getDistribution();
                showMainUI(data_1);
            }
            else {
                try {
                    got('https://mysql.songs-of-war.com/maintenance').then(function (result) {
                        if (result.body == 'true') {
                            showFatalStartupErrorServerMaintenance();
                            console.log('Server maintenance true');
                        }
                        else {
                            showFatalStartupError();
                            console.log('Server maintenance false');
                        }
                    });
                }
                catch (error) {
                    console.error(error);
                    showFatalStartupError();
                }
            }
        }
    }
}, false);
// Actions that must be performed after the distribution index is downloaded.
ipcRenderer.on('distributionIndexDone', function (event, res) {
    if (res) {
        var data_2 = DistroManager.getDistribution();
        syncModConfigurations(data_2);
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            showMainUI(data_2);
        }
        else {
            rscShouldLoad = true;
        }
    }
    else {
        fatalStartupError = true;
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            try {
                got('https://mysql.songs-of-war.com/maintenance').then(function (result) {
                    if (result.body == 'true') {
                        showFatalStartupErrorServerMaintenance();
                        console.log('Server maintenance true');
                    }
                    else {
                        showFatalStartupError();
                        console.log('Server maintenance false');
                        console.log(result);
                    }
                });
            }
            catch (error) {
                console.error(error);
                showFatalStartupError();
            }
        }
        else {
            rscShouldLoad = true;
        }
    }
});
