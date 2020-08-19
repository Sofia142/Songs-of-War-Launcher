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
// Requirements
var os = require('os');
var semver = require('semver');
var JavaGuard = require('./assets/js/assetguard').JavaGuard;
var DropinModUtil = require('./assets/js/dropinmodutil');
var settingsState = {
    invalid: new Set()
};
function bindSettingsSelect() {
    for (var _i = 0, _a = document.getElementsByClassName('settingsSelectContainer'); _i < _a.length; _i++) {
        var ele = _a[_i];
        var selectedDiv = ele.getElementsByClassName('settingsSelectSelected')[0];
        selectedDiv.onclick = function (e) {
            e.stopPropagation();
            closeSettingsSelect(e.target);
            e.target.nextElementSibling.toggleAttribute('hidden');
            e.target.classList.toggle('select-arrow-active');
        };
    }
}
function closeSettingsSelect(el) {
    for (var _i = 0, _a = document.getElementsByClassName('settingsSelectContainer'); _i < _a.length; _i++) {
        var ele = _a[_i];
        var selectedDiv = ele.getElementsByClassName('settingsSelectSelected')[0];
        var optionsDiv = ele.getElementsByClassName('settingsSelectOptions')[0];
        if (!(selectedDiv === el)) {
            selectedDiv.classList.remove('select-arrow-active');
            optionsDiv.setAttribute('hidden', '');
        }
    }
}
/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener('click', closeSettingsSelect);
bindSettingsSelect();
function bindFileSelectors() {
    var _this = this;
    var _loop_1 = function (ele) {
        ele.onclick = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var isJavaExecSel, directoryDialog, properties, options, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isJavaExecSel = ele.id === 'settingsJavaExecSel';
                        directoryDialog = ele.hasAttribute('dialogDirectory') && ele.getAttribute('dialogDirectory') == 'true';
                        properties = directoryDialog ? ['openDirectory', 'createDirectory'] : ['openFile'];
                        options = {
                            properties: properties
                        };
                        if (ele.hasAttribute('dialogTitle')) {
                            options.title = ele.getAttribute('dialogTitle');
                        }
                        if (isJavaExecSel && process.platform === 'win32') {
                            options.filters = [
                                { name: 'Executables', extensions: ['exe'] },
                                { name: 'All Files', extensions: ['*'] }
                            ];
                        }
                        return [4 /*yield*/, remote.dialog.showOpenDialog(remote.getCurrentWindow(), options)];
                    case 1:
                        res = _a.sent();
                        if (!res.canceled) {
                            ele.previousElementSibling.value = res.filePaths[0];
                            if (isJavaExecSel) {
                                populateJavaExecDetails(ele.previousElementSibling.value);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        }); };
    };
    for (var _i = 0, _a = document.getElementsByClassName('settingsFileSelButton'); _i < _a.length; _i++) {
        var ele = _a[_i];
        _loop_1(ele);
    }
}
bindFileSelectors();
/**
 * General Settings Functions
 */
/**
  * Bind value validators to the settings UI elements. These will
  * validate against the criteria defined in the ConfigManager (if
  * and). If the value is invalid, the UI will reflect this and saving
  * will be disabled until the value is corrected. This is an automated
  * process. More complex UI may need to be bound separately.
  */
function initSettingsValidators() {
    var sEls = document.getElementById('settingsContainer').querySelectorAll('[cValue]');
    Array.from(sEls).map(function (v, index, arr) {
        var vFn = ConfigManager['validate' + v.getAttribute('cValue')];
        if (typeof vFn === 'function') {
            if (v.tagName === 'INPUT') {
                if (v.type === 'number' || v.type === 'text') {
                    v.addEventListener('keyup', function (e) {
                        var v = e.target;
                        if (!vFn(v.value)) {
                            settingsState.invalid.add(v.id);
                            v.setAttribute('error', '');
                            settingsSaveDisabled(true);
                        }
                        else {
                            if (v.hasAttribute('error')) {
                                v.removeAttribute('error');
                                settingsState.invalid.delete(v.id);
                                if (settingsState.invalid.size === 0) {
                                    settingsSaveDisabled(false);
                                }
                            }
                        }
                    });
                }
            }
        }
    });
}
/**
 * Load configuration values onto the UI. This is an automated process.
 */
function initSettingsValues() {
    var sEls = document.getElementById('settingsContainer').querySelectorAll('[cValue]');
    Array.from(sEls).map(function (v, index, arr) {
        var cVal = v.getAttribute('cValue');
        var gFn = ConfigManager['get' + cVal];
        if (typeof gFn === 'function') {
            if (v.tagName === 'INPUT') {
                if (v.type === 'number' || v.type === 'text') {
                    // Special Conditions
                    if (cVal === 'JavaExecutable') {
                        populateJavaExecDetails(v.value);
                        v.value = gFn();
                    }
                    else if (cVal === 'DataDirectory') {
                        v.value = gFn();
                    }
                    else if (cVal === 'JVMOptions') {
                        v.value = gFn().join(' ');
                    }
                    else {
                        v.value = gFn();
                    }
                }
                else if (v.type === 'checkbox') {
                    v.checked = gFn();
                }
            }
            else if (v.tagName === 'DIV') {
                if (v.classList.contains('rangeSlider')) {
                    // Special Conditions
                    if (cVal === 'MinRAM' || cVal === 'MaxRAM') {
                        var val = gFn();
                        if (val.endsWith('M')) {
                            val = Number(val.substring(0, val.length - 1)) / 1000;
                        }
                        else {
                            val = Number.parseFloat(val);
                        }
                        v.setAttribute('value', val);
                    }
                    else {
                        v.setAttribute('value', Number.parseFloat(gFn()));
                    }
                }
            }
        }
    });
}
/**
 * Save the settings values.
 */
function saveSettingsValues() {
    var sEls = document.getElementById('settingsContainer').querySelectorAll('[cValue]');
    Array.from(sEls).map(function (v, index, arr) {
        var cVal = v.getAttribute('cValue');
        var sFn = ConfigManager['set' + cVal];
        if (typeof sFn === 'function') {
            if (v.tagName === 'INPUT') {
                if (v.type === 'number' || v.type === 'text') {
                    // Special Conditions
                    if (cVal === 'JVMOptions') {
                        sFn(v.value.split(' '));
                    }
                    else {
                        sFn(v.value);
                    }
                }
                else if (v.type === 'checkbox') {
                    sFn(v.checked);
                    // Special Conditions
                    if (cVal === 'AllowPrerelease') {
                        changeAllowPrerelease(v.checked);
                    }
                }
            }
            else if (v.tagName === 'DIV') {
                if (v.classList.contains('rangeSlider')) {
                    // Special Conditions
                    if (cVal === 'MinRAM' || cVal === 'MaxRAM') {
                        var val = Number(v.getAttribute('value'));
                        if (val % 1 > 0) {
                            val = val * 1000 + 'M';
                        }
                        else {
                            val = val + 'G';
                        }
                        sFn(val);
                    }
                    else {
                        sFn(v.getAttribute('value'));
                    }
                }
            }
        }
    });
}
var selectedSettingsTab = 'settingsTabAccount';
/**
 * Modify the settings container UI when the scroll threshold reaches
 * a certain poin.
 *
 * @param {UIEvent} e The scroll event.
 */
function settingsTabScrollListener(e) {
    if (e.target.scrollTop > Number.parseFloat(getComputedStyle(e.target.firstElementChild).marginTop)) {
        document.getElementById('settingsContainer').setAttribute('scrolled', '');
    }
    else {
        document.getElementById('settingsContainer').removeAttribute('scrolled');
    }
}
/**
 * Bind functionality for the settings navigation items.
 */
function setupSettingsTabs() {
    Array.from(document.getElementsByClassName('settingsNavItem')).map(function (val) {
        if (val.hasAttribute('rSc')) {
            val.onclick = function () {
                settingsNavItemListener(val);
            };
        }
    });
}
/**
 * Settings nav item onclick lisener. Function is exposed so that
 * other UI elements can quickly toggle to a certain tab from other views.
 *
 * @param {Element} ele The nav item which has been clicked.
 * @param {boolean} fade Optional. True to fade transition.
 */
function settingsNavItemListener(ele, fade) {
    if (fade === void 0) { fade = true; }
    if (ele.hasAttribute('selected')) {
        return;
    }
    var navItems = document.getElementsByClassName('settingsNavItem');
    for (var i = 0; i < navItems.length; i++) {
        if (navItems[i].hasAttribute('selected')) {
            navItems[i].removeAttribute('selected');
        }
    }
    ele.setAttribute('selected', '');
    var prevTab = selectedSettingsTab;
    selectedSettingsTab = ele.getAttribute('rSc');
    document.getElementById(prevTab).onscroll = null;
    document.getElementById(selectedSettingsTab).onscroll = settingsTabScrollListener;
    if (fade) {
        $("#" + prevTab).fadeOut(250, function () {
            $("#" + selectedSettingsTab).fadeIn({
                duration: 250,
                start: function () {
                    settingsTabScrollListener({
                        target: document.getElementById(selectedSettingsTab)
                    });
                }
            });
        });
    }
    else {
        $("#" + prevTab).hide(0, function () {
            $("#" + selectedSettingsTab).show({
                duration: 0,
                start: function () {
                    settingsTabScrollListener({
                        target: document.getElementById(selectedSettingsTab)
                    });
                }
            });
        });
    }
}
var settingsNavDone = document.getElementById('settingsNavDone');
/**
 * Set if the settings save (done) button is disabled.
 *
 * @param {boolean} v True to disable, false to enable.
 */
function settingsSaveDisabled(v) {
    settingsNavDone.disabled = v;
}
/* Closes the settings view and saves all data. */
settingsNavDone.onclick = function () {
    saveSettingsValues();
    saveModConfiguration();
    ConfigManager.save();
    //saveDropinModConfiguration()
    saveShaderpackSettings();
    switchView(getCurrentView(), VIEWS.landing);
};
/**
 * Account Management Tab
 */
// Bind the add account button.
document.getElementById('settingsAddAccount').onclick = function (e) {
    switchView(getCurrentView(), VIEWS.login, 500, 500, function () {
        loginViewOnCancel = VIEWS.settings;
        loginViewOnSuccess = VIEWS.settings;
        loginCancelEnabled(true);
    });
};
document.getElementById('');
/**
 * Bind functionality for the account selection buttons. If another account
 * is selected, the UI of the previously selected account will be updated.
 */
function bindAuthAccountSelect() {
    Array.from(document.getElementsByClassName('settingsAuthAccountSelect')).map(function (val) {
        val.onclick = function (e) {
            if (val.hasAttribute('selected')) {
                return;
            }
            var selectBtns = document.getElementsByClassName('settingsAuthAccountSelect');
            for (var i = 0; i < selectBtns.length; i++) {
                if (selectBtns[i].hasAttribute('selected')) {
                    selectBtns[i].removeAttribute('selected');
                    selectBtns[i].innerHTML = 'Select Account';
                }
            }
            val.setAttribute('selected', '');
            val.innerHTML = 'Selected Account &#10004;';
            setSelectedAccount(val.closest('.settingsAuthAccount').getAttribute('uuid'));
        };
    });
}
/**
 * Bind functionality for the log out button. If the logged out account was
 * the selected account, another account will be selected and the UI will
 * be updated accordingly.
 */
function bindAuthAccountLogOut() {
    Array.from(document.getElementsByClassName('settingsAuthAccountLogOut')).map(function (val) {
        val.onclick = function (e) {
            var isLastAccount = false;
            if (Object.keys(ConfigManager.getAuthAccounts()).length === 1) {
                isLastAccount = true;
                setOverlayContent('Warning<br>This is Your Last Account', 'In order to use the launcher you must be logged into at least one account. You will need to login again after.<br><br>Are you sure you want to log out?', 'I\'m Sure', 'Cancel');
                setOverlayHandler(function () {
                    processLogOut(val, isLastAccount);
                    toggleOverlay(false);
                    switchView(getCurrentView(), VIEWS.login);
                });
                setDismissHandler(function () {
                    toggleOverlay(false);
                });
                toggleOverlay(true, true);
            }
            else {
                processLogOut(val, isLastAccount);
            }
        };
    });
}
/**
 * Process a log out.
 *
 * @param {Element} val The log out button element.
 * @param {boolean} isLastAccount If this logout is on the last added account.
 */
function processLogOut(val, isLastAccount) {
    var parent = val.closest('.settingsAuthAccount');
    var uuid = parent.getAttribute('uuid');
    var prevSelAcc = ConfigManager.getSelectedAccount();
    AuthManager.removeAccount(uuid).then(function () {
        if (!isLastAccount && uuid === prevSelAcc.uuid) {
            var selAcc = ConfigManager.getSelectedAccount();
            refreshAuthAccountSelected(selAcc.uuid);
            updateSelectedAccount(selAcc);
            validateSelectedAccount();
        }
    });
    $(parent).fadeOut(250, function () {
        parent.remove();
    });
}
/**
 * Refreshes the status of the selected account on the auth account
 * elements.
 *
 * @param {string} uuid The UUID of the new selected account.
 */
function refreshAuthAccountSelected(uuid) {
    Array.from(document.getElementsByClassName('settingsAuthAccount')).map(function (val) {
        var selBtn = val.getElementsByClassName('settingsAuthAccountSelect')[0];
        if (uuid === val.getAttribute('uuid')) {
            selBtn.setAttribute('selected', '');
            selBtn.innerHTML = 'Selected Account &#10004;';
        }
        else {
            if (selBtn.hasAttribute('selected')) {
                selBtn.removeAttribute('selected');
            }
            selBtn.innerHTML = 'Select Account';
        }
    });
}
var settingsCurrentAccounts = document.getElementById('settingsCurrentAccounts');
/**
 * Add auth account elements for each one stored in the authentication database.
 */
function populateAuthAccounts() {
    var authAccounts = ConfigManager.getAuthAccounts();
    var authKeys = Object.keys(authAccounts);
    if (authKeys.length === 0) {
        return;
    }
    var selectedUUID = ConfigManager.getSelectedAccount().uuid;
    var authAccountStr = '';
    authKeys.map(function (val) {
        var acc = authAccounts[val];
        authAccountStr += "<div class=\"settingsAuthAccount\" uuid=\"" + acc.uuid + "\">\n            <div class=\"settingsAuthAccountLeft\">\n                <img class=\"settingsAuthAccountImage\" alt=\"" + acc.displayName + "\" src=\"https://crafatar.com/renders/body/" + acc.uuid + "?scale=3&default=MHF_Steve&overlay\">\n            </div>\n            <div class=\"settingsAuthAccountRight\">\n                <div class=\"settingsAuthAccountDetails\">\n                    <div class=\"settingsAuthAccountDetailPane\">\n                        <div class=\"settingsAuthAccountDetailTitle\">Username</div>\n                        <div class=\"settingsAuthAccountDetailValue\">" + acc.displayName + "</div>\n                    </div>\n                    <div class=\"settingsAuthAccountDetailPane\">\n                        <div class=\"settingsAuthAccountDetailTitle\">UUID</div>\n                        <div class=\"settingsAuthAccountDetailValue\">" + acc.uuid + "</div>\n                    </div>\n                </div>\n                <div class=\"settingsAuthAccountActions\">\n                    <button class=\"settingsAuthAccountSelect\" " + (selectedUUID === acc.uuid ? 'selected>Selected Account &#10004;' : '>Select Account') + "</button>\n                    <div class=\"settingsAuthAccountWrapper\">\n                        <button class=\"settingsAuthAccountLogOut\">Log Out</button>\n                    </div>\n                </div>\n            </div>\n        </div>";
    });
    settingsCurrentAccounts.innerHTML = authAccountStr;
}
/**
 * Prepare the accounts tab for display.
 */
function prepareAccountsTab() {
    populateAuthAccounts();
    bindAuthAccountSelect();
    bindAuthAccountLogOut();
}
/**
 * Minecraft Tab
 */
/**
  * Disable decimals, negative signs, and scientific notation.
  */
document.getElementById('settingsGameWidth').addEventListener('keydown', function (e) {
    if (/^[-.eE]$/.test(e.key)) {
        e.preventDefault();
    }
});
document.getElementById('settingsGameHeight').addEventListener('keydown', function (e) {
    if (/^[-.eE]$/.test(e.key)) {
        e.preventDefault();
    }
});
/**
 * Mods Tab
 */
var settingsModsContainer = document.getElementById('settingsModsContainer');
/**
 * Resolve and update the mods on the UI.
 */
function resolveModsForUI() {
    var serv = ConfigManager.getSelectedServer();
    var distro = DistroManager.getDistribution();
    var servConf = ConfigManager.getModConfiguration(serv);
    var modStr = parseModulesForUI(distro.getServer(serv).getModules(), false, servConf.mods);
    document.getElementById('settingsReqModsContent').innerHTML = modStr.reqMods;
    document.getElementById('settingsOptModsContent').innerHTML = modStr.optMods;
}
/**
 * Recursively build the mod UI elements.
 *
 * @param {Object[]} mdls An array of modules to parse.
 * @param {boolean} submodules Whether or not we are parsing submodules.
 * @param {Object} servConf The server configuration object for this module level.
 */
function parseModulesForUI(mdls, submodules, servConf) {
    var reqMods = '';
    var optMods = '';
    for (var _i = 0, mdls_1 = mdls; _i < mdls_1.length; _i++) {
        var mdl = mdls_1[_i];
        if (mdl.getType() === DistroManager.Types.ForgeMod || mdl.getType() === DistroManager.Types.LiteMod || mdl.getType() === DistroManager.Types.LiteLoader) {
            if (mdl.getRequired().isRequired()) {
                reqMods += "<div id=\"" + mdl.getVersionlessID() + "\" class=\"settingsBaseMod settings" + (submodules ? 'Sub' : '') + "Mod\" enabled>\n                    <div class=\"settingsModContent\">\n                        <div class=\"settingsModMainWrapper\">\n                            <div class=\"settingsModStatus\"></div>\n                            <div class=\"settingsModDetails\">\n                                <span class=\"settingsModName\">" + mdl.getName() + "</span>\n                                <span class=\"settingsModVersion\">v" + mdl.getVersion() + "</span>\n                            </div>\n                        </div>\n                        <label class=\"toggleSwitch\" reqmod>\n                            <input type=\"checkbox\" checked>\n                            <span class=\"toggleSwitchSlider\"></span>\n                        </label>\n                    </div>\n                    " + (mdl.hasSubModules() ? "<div class=\"settingsSubModContainer\">\n                        " + Object.values(parseModulesForUI(mdl.getSubModules(), true, servConf[mdl.getVersionlessID()])).join('') + "\n                    </div>" : '') + "\n                </div>";
            }
            else {
                var conf = servConf[mdl.getVersionlessID()];
                var val = typeof conf === 'object' ? conf.value : conf;
                optMods += "<div id=\"" + mdl.getVersionlessID() + "\" class=\"settingsBaseMod settings" + (submodules ? 'Sub' : '') + "Mod\" " + (val ? 'enabled' : '') + ">\n                    <div class=\"settingsModContent\">\n                        <div class=\"settingsModMainWrapper\">\n                            <div class=\"settingsModStatus\"></div>\n                            <div class=\"settingsModDetails\">\n                                <span class=\"settingsModName\">" + mdl.getName() + "</span>\n                                <span class=\"settingsModVersion\">v" + mdl.getVersion() + "</span>\n                            </div>\n                        </div>\n                        <label class=\"toggleSwitch\">\n                            <input type=\"checkbox\" formod=\"" + mdl.getVersionlessID() + "\" " + (val ? 'checked' : '') + ">\n                            <span class=\"toggleSwitchSlider\"></span>\n                        </label>\n                    </div>\n                    " + (mdl.hasSubModules() ? "<div class=\"settingsSubModContainer\">\n                        " + Object.values(parseModulesForUI(mdl.getSubModules(), true, conf.mods)).join('') + "\n                    </div>" : '') + "\n                </div>";
            }
        }
    }
    return {
        reqMods: reqMods,
        optMods: optMods
    };
}
/**
 * Bind functionality to mod config toggle switches. Switching the value
 * will also switch the status color on the left of the mod UI.
 */
function bindModsToggleSwitch() {
    var sEls = settingsModsContainer.querySelectorAll('[formod]');
    Array.from(sEls).map(function (v, index, arr) {
        v.onchange = function () {
            if (v.checked) {
                document.getElementById(v.getAttribute('formod')).setAttribute('enabled', '');
            }
            else {
                document.getElementById(v.getAttribute('formod')).removeAttribute('enabled');
            }
        };
    });
}
document.getElementById('');
/**
 * Save the mod configuration based on the UI values.
 */
function saveModConfiguration() {
    var serv = ConfigManager.getSelectedServer();
    var modConf = ConfigManager.getModConfiguration(serv);
    modConf.mods = _saveModConfiguration(modConf.mods);
    ConfigManager.setModConfiguration(serv, modConf);
}
/**
 * Recursively save mod config with submods.
 *
 * @param {Object} modConf Mod config object to save.
 */
function _saveModConfiguration(modConf) {
    for (var _i = 0, _a = Object.entries(modConf); _i < _a.length; _i++) {
        var m = _a[_i];
        var tSwitch = settingsModsContainer.querySelectorAll("[formod='" + m[0] + "']");
        if (!tSwitch[0].hasAttribute('dropin')) {
            if (typeof m[1] === 'boolean') {
                modConf[m[0]] = tSwitch[0].checked;
            }
            else {
                if (m[1] != null) {
                    if (tSwitch.length > 0) {
                        modConf[m[0]].value = tSwitch[0].checked;
                    }
                    modConf[m[0]].mods = _saveModConfiguration(modConf[m[0]].mods);
                }
            }
        }
    }
    return modConf;
}
// Drop-in mod elements.
var CACHE_SETTINGS_MODS_DIR;
var CACHE_DROPIN_MODS;
/**
 * Resolve any located drop-in mods for this server and
 * populate the results onto the UI.
 */
function resolveDropinModsForUI() {
    var serv = DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer());
    CACHE_SETTINGS_MODS_DIR = path.join(ConfigManager.getInstanceDirectory(), serv.getID(), 'mods');
    CACHE_DROPIN_MODS = DropinModUtil.scanForDropinMods(CACHE_SETTINGS_MODS_DIR, serv.getMinecraftVersion());
    var dropinMods = '';
    for (var _i = 0, CACHE_DROPIN_MODS_1 = CACHE_DROPIN_MODS; _i < CACHE_DROPIN_MODS_1.length; _i++) {
        dropin = CACHE_DROPIN_MODS_1[_i];
        dropinMods += "<div id=\"" + dropin.fullName + "\" class=\"settingsBaseMod settingsDropinMod\" " + (!dropin.disabled ? 'enabled' : '') + ">\n                    <div class=\"settingsModContent\">\n                        <div class=\"settingsModMainWrapper\">\n                            <div class=\"settingsModStatus\"></div>\n                            <div class=\"settingsModDetails\">\n                                <span class=\"settingsModName\">" + dropin.name + "</span>\n                                <div class=\"settingsDropinRemoveWrapper\">\n                                    <button class=\"settingsDropinRemoveButton\" remmod=\"" + dropin.fullName + "\">Remove</button>\n                                </div>\n                            </div>\n                        </div>\n                        <label class=\"toggleSwitch\">\n                            <input type=\"checkbox\" formod=\"" + dropin.fullName + "\" dropin " + (!dropin.disabled ? 'checked' : '') + ">\n                            <span class=\"toggleSwitchSlider\"></span>\n                        </label>\n                    </div>\n                </div>";
    }
    //document.getElementById('settingsDropinModsContent').innerHTML = dropinMods
}
/**
 * Bind the remove button for each loaded drop-in mod.
 */
function bindDropinModsRemoveButton() {
    var sEls = settingsModsContainer.querySelectorAll('[remmod]');
    Array.from(sEls).map(function (v, index, arr) {
        v.onclick = function () {
            var fullName = v.getAttribute('remmod');
            var res = DropinModUtil.deleteDropinMod(CACHE_SETTINGS_MODS_DIR, fullName);
            if (res) {
                document.getElementById(fullName).remove();
            }
            else {
                setOverlayContent("Failed to Delete<br>Drop-in Mod " + fullName, 'Make sure the file is not in use and try again.', 'Okay');
                setOverlayHandler(null);
                toggleOverlay(true);
            }
        };
    });
}
/**
 * Bind functionality to the file system button for the selected
 * server configuration.
 */
/*function bindDropinModFileSystemButton(){
    const fsBtn = document.getElementById('settingsDropinFileSystemButton')
    fsBtn.onclick = () => {
        DropinModUtil.validateDir(CACHE_SETTINGS_MODS_DIR)
        shell.openPath(CACHE_SETTINGS_MODS_DIR)
    }
    fsBtn.ondragenter = e => {
        e.dataTransfer.dropEffect = 'move'
        fsBtn.setAttribute('drag', '')
        e.preventDefault()
    }
    fsBtn.ondragover = e => {
        e.preventDefault()
    }
    fsBtn.ondragleave = e => {
        fsBtn.removeAttribute('drag')
    }

    fsBtn.ondrop = e => {
        fsBtn.removeAttribute('drag')
        e.preventDefault()

        DropinModUtil.addDropinMods(e.dataTransfer.files, CACHE_SETTINGS_MODS_DIR)
        reloadDropinMods()
    }
}*/
/**
 * Save drop-in mod states. Enabling and disabling is just a matter
 * of adding/removing the .disabled extension.
 */
/*function saveDropinModConfiguration(){
    for(dropin of CACHE_DROPIN_MODS){
        const dropinUI = document.getElementById(dropin.fullName)
        if(dropinUI != null){
            const dropinUIEnabled = dropinUI.hasAttribute('enabled')
            if(DropinModUtil.isDropinModEnabled(dropin.fullName) != dropinUIEnabled){
                DropinModUtil.toggleDropinMod(CACHE_SETTINGS_MODS_DIR, dropin.fullName, dropinUIEnabled).catch(err => {
                    if(!isOverlayVisible()){
                        setOverlayContent(
                            'Failed to Toggle<br>One or More Drop-in Mods',
                            err.message,
                            'Okay'
                        )
                        setOverlayHandler(null)
                        toggleOverlay(true)
                    }
                })
            }
        }
    }
}*/
// Refresh the drop-in mods when F5 is pressed.
// Only active on the mods tab.
document.addEventListener('keydown', function (e) {
    if (getCurrentView() === VIEWS.settings && selectedSettingsTab === 'settingsTabMods') {
        if (e.key === 'F5') {
            reloadDropinMods();
            saveShaderpackSettings();
            resolveShaderpacksForUI();
        }
    }
});
function reloadDropinMods() {
    resolveDropinModsForUI();
    bindDropinModsRemoveButton();
    bindDropinModFileSystemButton();
    bindModsToggleSwitch();
}
// Shaderpack
var CACHE_SETTINGS_INSTANCE_DIR;
var CACHE_SHADERPACKS;
var CACHE_SELECTED_SHADERPACK;
/**
 * Load shaderpack information.
 */
function resolveShaderpacksForUI() {
    var serv = DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer());
    CACHE_SETTINGS_INSTANCE_DIR = path.join(ConfigManager.getInstanceDirectory(), serv.getID());
    CACHE_SHADERPACKS = DropinModUtil.scanForShaderpacks(CACHE_SETTINGS_INSTANCE_DIR);
    CACHE_SELECTED_SHADERPACK = DropinModUtil.getEnabledShaderpack(CACHE_SETTINGS_INSTANCE_DIR);
    setShadersOptions(CACHE_SHADERPACKS, CACHE_SELECTED_SHADERPACK);
}
function setShadersOptions(arr, selected) {
    var cont = document.getElementById('settingsShadersOptions');
    cont.innerHTML = '';
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var opt = arr_1[_i];
        var d = document.createElement('DIV');
        d.innerHTML = opt.name;
        d.setAttribute('value', opt.fullName);
        if (opt.fullName === selected) {
            d.setAttribute('selected', '');
            document.getElementById('settingsShadersSelected').innerHTML = opt.name;
        }
        d.addEventListener('click', function (e) {
            this.parentNode.previousElementSibling.innerHTML = this.innerHTML;
            for (var _i = 0, _a = this.parentNode.children; _i < _a.length; _i++) {
                var sib = _a[_i];
                sib.removeAttribute('selected');
            }
            this.setAttribute('selected', '');
            closeSettingsSelect();
        });
        cont.appendChild(d);
    }
}
function saveShaderpackSettings() {
    var sel = 'OFF';
    for (var _i = 0, _a = document.getElementById('settingsShadersOptions').childNodes; _i < _a.length; _i++) {
        var opt = _a[_i];
        if (opt.hasAttribute('selected')) {
            sel = opt.getAttribute('value');
        }
    }
    DropinModUtil.setEnabledShaderpack(CACHE_SETTINGS_INSTANCE_DIR, sel);
}
function bindShaderpackButton() {
    var spBtn = document.getElementById('settingsShaderpackButton');
    spBtn.onclick = function () {
        var p = path.join(CACHE_SETTINGS_INSTANCE_DIR, 'shaderpacks');
        DropinModUtil.validateDir(p);
        shell.openPath(p);
    };
    spBtn.ondragenter = function (e) {
        e.dataTransfer.dropEffect = 'move';
        spBtn.setAttribute('drag', '');
        e.preventDefault();
    };
    spBtn.ondragover = function (e) {
        e.preventDefault();
    };
    spBtn.ondragleave = function (e) {
        spBtn.removeAttribute('drag');
    };
    spBtn.ondrop = function (e) {
        spBtn.removeAttribute('drag');
        e.preventDefault();
        DropinModUtil.addShaderpacks(e.dataTransfer.files, CACHE_SETTINGS_INSTANCE_DIR);
        saveShaderpackSettings();
        resolveShaderpacksForUI();
    };
}
// Server status bar functions.
/**
 * Load the currently selected server information onto the mods tab.
 */
function loadSelectedServerOnModsTab() {
    var serv = DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer());
    document.getElementById('settingsSelServContent').innerHTML = "\n        <img class=\"serverListingImg\" src=\"" + serv.getIcon() + "\"/>\n        <div class=\"serverListingDetails\">\n            <span class=\"serverListingName\">" + serv.getName() + "</span>\n            <span class=\"serverListingDescription\">" + serv.getDescription() + "</span>\n            <div class=\"serverListingInfo\">\n                <div class=\"serverListingVersion\">" + serv.getMinecraftVersion() + "</div>\n                <div class=\"serverListingRevision\">" + serv.getVersion() + "</div>\n                " + (serv.isMainServer() ? "<div class=\"serverListingStarWrapper\">\n                    <svg id=\"Layer_1\" viewBox=\"0 0 107.45 104.74\" width=\"20px\" height=\"20px\">\n                        <defs>\n                            <style>.cls-1{fill:#fff;}.cls-2{fill:none;stroke:#fff;stroke-miterlimit:10;}</style>\n                        </defs>\n                        <path class=\"cls-1\" d=\"M100.93,65.54C89,62,68.18,55.65,63.54,52.13c2.7-5.23,18.8-19.2,28-27.55C81.36,31.74,63.74,43.87,58.09,45.3c-2.41-5.37-3.61-26.52-4.37-39-.77,12.46-2,33.64-4.36,39-5.7-1.46-23.3-13.57-33.49-20.72,9.26,8.37,25.39,22.36,28,27.55C39.21,55.68,18.47,62,6.52,65.55c12.32-2,33.63-6.06,39.34-4.9-.16,5.87-8.41,26.16-13.11,37.69,6.1-10.89,16.52-30.16,21-33.9,4.5,3.79,14.93,23.09,21,34C70,86.84,61.73,66.48,61.59,60.65,67.36,59.49,88.64,63.52,100.93,65.54Z\"/>\n                        <circle class=\"cls-2\" cx=\"53.73\" cy=\"53.9\" r=\"38\"/>\n                    </svg>\n                    <span class=\"serverListingStarTooltip\">Main Server</span>\n                </div>" : '') + "\n            </div>\n        </div>\n    ";
}
// Bind functionality to the server switch button.
document.getElementById('settingsSwitchServerButton').addEventListener('click', function (e) {
    e.target.blur();
    toggleServerSelection(true);
});
/**
 * Save mod configuration for the current selected server.
 */
function saveAllModConfigurations() {
    saveModConfiguration();
    ConfigManager.save();
    saveDropinModConfiguration();
}
/**
 * Function to refresh the mods tab whenever the selected
 * server is changed.
 */
function animateModsTabRefresh() {
    $('#settingsTabMods').fadeOut(500, function () {
        prepareModsTab();
        $('#settingsTabMods').fadeIn(500);
    });
}
/**
 * Prepare the Mods tab for display.
 */
function prepareModsTab(first) {
    resolveModsForUI();
    //resolveDropinModsForUI()
    resolveShaderpacksForUI();
    //bindDropinModsRemoveButton()
    //bindDropinModFileSystemButton()
    bindShaderpackButton();
    bindModsToggleSwitch();
    loadSelectedServerOnModsTab();
}
/**
 * Java Tab
 */
// DOM Cache
var settingsMaxRAMRange = document.getElementById('settingsMaxRAMRange');
var settingsMinRAMRange = document.getElementById('settingsMinRAMRange');
var settingsMaxRAMLabel = document.getElementById('settingsMaxRAMLabel');
var settingsMinRAMLabel = document.getElementById('settingsMinRAMLabel');
var settingsMemoryTotal = document.getElementById('settingsMemoryTotal');
var settingsMemoryAvail = document.getElementById('settingsMemoryAvail');
var settingsJavaExecDetails = document.getElementById('settingsJavaExecDetails');
// Store maximum memory values.
var SETTINGS_MAX_MEMORY = ConfigManager.getAbsoluteMaxRAM();
var SETTINGS_MIN_MEMORY = ConfigManager.getAbsoluteMinRAM();
// Set the max and min values for the ranged sliders.
settingsMaxRAMRange.setAttribute('max', SETTINGS_MAX_MEMORY);
settingsMaxRAMRange.setAttribute('min', SETTINGS_MIN_MEMORY);
settingsMinRAMRange.setAttribute('max', SETTINGS_MAX_MEMORY);
settingsMinRAMRange.setAttribute('min', SETTINGS_MIN_MEMORY);
// Bind on change event for min memory container.
settingsMinRAMRange.onchange = function (e) {
    // Current range values
    var sMaxV = Number(settingsMaxRAMRange.getAttribute('value'));
    var sMinV = Number(settingsMinRAMRange.getAttribute('value'));
    // Get reference to range bar.
    var bar = e.target.getElementsByClassName('rangeSliderBar')[0];
    // Calculate effective total memory.
    var max = (os.totalmem() - 1000000000) / 1000000000;
    // Change range bar color based on the selected value.
    if (sMinV >= max / 2) {
        bar.style.background = '#e86060';
    }
    else if (sMinV >= max / 4) {
        bar.style.background = '#e8e18b';
    }
    else {
        bar.style.background = null;
    }
    // Increase maximum memory if the minimum exceeds its value.
    if (sMaxV < sMinV) {
        var sliderMeta = calculateRangeSliderMeta(settingsMaxRAMRange);
        updateRangedSlider(settingsMaxRAMRange, sMinV, ((sMinV - sliderMeta.min) / sliderMeta.step) * sliderMeta.inc);
        settingsMaxRAMLabel.innerHTML = sMinV.toFixed(1) + 'G';
    }
    // Update label
    settingsMinRAMLabel.innerHTML = sMinV.toFixed(1) + 'G';
};
// Bind on change event for max memory container.
settingsMaxRAMRange.onchange = function (e) {
    // Current range values
    var sMaxV = Number(settingsMaxRAMRange.getAttribute('value'));
    var sMinV = Number(settingsMinRAMRange.getAttribute('value'));
    // Get reference to range bar.
    var bar = e.target.getElementsByClassName('rangeSliderBar')[0];
    // Calculate effective total memory.
    var max = (os.totalmem() - 1000000000) / 1000000000;
    // Change range bar color based on the selected value.
    if (sMaxV >= max / 2) {
        bar.style.background = '#e86060';
    }
    else if (sMaxV >= max / 4) {
        bar.style.background = '#e8e18b';
    }
    else {
        bar.style.background = null;
    }
    // Decrease the minimum memory if the maximum value is less.
    if (sMaxV < sMinV) {
        var sliderMeta = calculateRangeSliderMeta(settingsMaxRAMRange);
        updateRangedSlider(settingsMinRAMRange, sMaxV, ((sMaxV - sliderMeta.min) / sliderMeta.step) * sliderMeta.inc);
        settingsMinRAMLabel.innerHTML = sMaxV.toFixed(1) + 'G';
    }
    settingsMaxRAMLabel.innerHTML = sMaxV.toFixed(1) + 'G';
};
/**
 * Calculate common values for a ranged slider.
 *
 * @param {Element} v The range slider to calculate against.
 * @returns {Object} An object with meta values for the provided ranged slider.
 */
function calculateRangeSliderMeta(v) {
    var val = {
        max: Number(v.getAttribute('max')),
        min: Number(v.getAttribute('min')),
        step: Number(v.getAttribute('step')),
    };
    val.ticks = (val.max - val.min) / val.step;
    val.inc = 100 / val.ticks;
    return val;
}
/**
 * Binds functionality to the ranged sliders. They're more than
 * just divs now :').
 */
function bindRangeSlider() {
    Array.from(document.getElementsByClassName('rangeSlider')).map(function (v) {
        // Reference the track (thumb).
        var track = v.getElementsByClassName('rangeSliderTrack')[0];
        // Set the initial slider value.
        var value = v.getAttribute('value');
        var sliderMeta = calculateRangeSliderMeta(v);
        updateRangedSlider(v, value, ((value - sliderMeta.min) / sliderMeta.step) * sliderMeta.inc);
        // The magic happens when we click on the track.
        track.onmousedown = function (e) {
            // Stop moving the track on mouse up.
            document.onmouseup = function (e) {
                document.onmousemove = null;
                document.onmouseup = null;
            };
            // Move slider according to the mouse position.
            document.onmousemove = function (e) {
                // Distance from the beginning of the bar in pixels.
                var diff = e.pageX - v.offsetLeft - track.offsetWidth / 2;
                // Don't move the track off the bar.
                if (diff >= 0 && diff <= v.offsetWidth - track.offsetWidth / 2) {
                    // Convert the difference to a percentage.
                    var perc = (diff / v.offsetWidth) * 100;
                    // Calculate the percentage of the closest notch.
                    var notch = Number(perc / sliderMeta.inc).toFixed(0) * sliderMeta.inc;
                    // If we're close to that notch, stick to it.
                    if (Math.abs(perc - notch) < sliderMeta.inc / 2) {
                        updateRangedSlider(v, sliderMeta.min + (sliderMeta.step * (notch / sliderMeta.inc)), notch);
                    }
                }
            };
        };
    });
}
/**
 * Update a ranged slider's value and position.
 *
 * @param {Element} element The ranged slider to update.
 * @param {string | number} value The new value for the ranged slider.
 * @param {number} notch The notch that the slider should now be at.
 */
function updateRangedSlider(element, value, notch) {
    var oldVal = element.getAttribute('value');
    var bar = element.getElementsByClassName('rangeSliderBar')[0];
    var track = element.getElementsByClassName('rangeSliderTrack')[0];
    element.setAttribute('value', value);
    if (notch < 0) {
        notch = 0;
    }
    else if (notch > 100) {
        notch = 100;
    }
    var event = new MouseEvent('change', {
        target: element,
        type: 'change',
        bubbles: false,
        cancelable: true
    });
    var cancelled = !element.dispatchEvent(event);
    if (!cancelled) {
        track.style.left = notch + '%';
        bar.style.width = notch + '%';
    }
    else {
        element.setAttribute('value', oldVal);
    }
}
/**
 * Display the total and available RAM.
 */
function populateMemoryStatus() {
    settingsMemoryTotal.innerHTML = Number((os.totalmem() - 1000000000) / 1000000000).toFixed(1) + 'G';
    settingsMemoryAvail.innerHTML = Number(os.freemem() / 1000000000).toFixed(1) + 'G';
}
/**
 * Validate the provided executable path and display the data on
 * the UI.
 *
 * @param {string} execPath The executable path to populate against.
 */
function populateJavaExecDetails(execPath) {
    var jg = new JavaGuard(DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer()).getMinecraftVersion());
    jg._validateJavaBinary(execPath).then(function (v) {
        if (v.valid) {
            if (v.version.major < 9) {
                settingsJavaExecDetails.innerHTML = "Selected: Java " + v.version.major + " Update " + v.version.update + " (x" + v.arch + ")";
            }
            else {
                settingsJavaExecDetails.innerHTML = "Selected: Java " + v.version.major + "." + v.version.minor + "." + v.version.revision + " (x" + v.arch + ")";
            }
        }
        else {
            settingsJavaExecDetails.innerHTML = 'Invalid Selection';
        }
    });
}
/**
 * Prepare the Java tab for display.
 */
function prepareJavaTab() {
    bindRangeSlider();
    populateMemoryStatus();
}
/**
 * About Tab
 */
var settingsTabAbout = document.getElementById('settingsTabAbout');
var settingsAboutChangelogTitle = settingsTabAbout.getElementsByClassName('settingsChangelogTitle')[0];
var settingsAboutChangelogText = settingsTabAbout.getElementsByClassName('settingsChangelogText')[0];
var settingsAboutChangelogButton = settingsTabAbout.getElementsByClassName('settingsChangelogButton')[0];
// Bind the devtools toggle button.
document.getElementById('settingsAboutDevToolsButton').onclick = function (e) {
    var window = remote.getCurrentWindow();
    window.toggleDevTools();
};
/**
 * Return whether or not the provided version is a prerelease.
 *
 * @param {string} version The semver version to test.
 * @returns {boolean} True if the version is a prerelease, otherwise false.
 */
function isPrerelease(version) {
    var preRelComp = semver.prerelease(version);
    return preRelComp != null && preRelComp.length > 0;
}
/**
 * Utility method to display version information on the
 * About and Update settings tabs.
 *
 * @param {string} version The semver version to display.
 * @param {Element} valueElement The value element.
 * @param {Element} titleElement The title element.
 * @param {Element} checkElement The check mark element.
 */
function populateVersionInformation(version, valueElement, titleElement, checkElement) {
    valueElement.innerHTML = version;
    if (isPrerelease(version)) {
        titleElement.innerHTML = 'Pre-release';
        titleElement.style.color = '#ff886d';
        checkElement.style.background = '#ff886d';
    }
    else {
        titleElement.innerHTML = 'Stable Release';
        titleElement.style.color = null;
        checkElement.style.background = null;
    }
}
/**
 * Retrieve the version information and display it on the UI.
 */
function populateAboutVersionInformation() {
    populateVersionInformation(remote.app.getVersion(), document.getElementById('settingsAboutCurrentVersionValue'), document.getElementById('settingsAboutCurrentVersionTitle'), document.getElementById('settingsAboutCurrentVersionCheck'));
}
/**
 * Fetches the GitHub atom release feed and parses it for the release notes
 * of the current version. This value is displayed on the UI.
 */
function populateReleaseNotes() {
    $.ajax({
        url: 'https://github.com/lucasboss45/Songs-Of-War-Launcher/releases.atom',
        success: function (data) {
            var version = 'v' + remote.app.getVersion();
            var entries = $(data).find('entry');
            for (var i = 0; i < entries.length; i++) {
                var entry = $(entries[i]);
                var id = entry.find('id').text();
                id = id.substring(id.lastIndexOf('/') + 1);
                if (id === version) {
                    settingsAboutChangelogTitle.innerHTML = entry.find('title').text();
                    settingsAboutChangelogText.innerHTML = entry.find('content').text();
                    settingsAboutChangelogButton.href = entry.find('link').attr('href');
                }
            }
        },
        timeout: 30000
    }).catch(function (err) {
        settingsAboutChangelogText.innerHTML = 'Failed to load release notes.';
    });
}
/**
 * Prepare account tab for display.
 */
function prepareAboutTab() {
    populateAboutVersionInformation();
    populateReleaseNotes();
}
/**
 * Update Tab
 */
var settingsTabUpdate = document.getElementById('settingsTabUpdate');
var settingsUpdateTitle = document.getElementById('settingsUpdateTitle');
var settingsUpdateVersionCheck = document.getElementById('settingsUpdateVersionCheck');
var settingsUpdateVersionTitle = document.getElementById('settingsUpdateVersionTitle');
var settingsUpdateVersionValue = document.getElementById('settingsUpdateVersionValue');
var settingsUpdateChangelogTitle = settingsTabUpdate.getElementsByClassName('settingsChangelogTitle')[0];
var settingsUpdateChangelogText = settingsTabUpdate.getElementsByClassName('settingsChangelogText')[0];
var settingsUpdateChangelogCont = settingsTabUpdate.getElementsByClassName('settingsChangelogContainer')[0];
var settingsUpdateActionButton = document.getElementById('settingsUpdateActionButton');
/**
 * Update the properties of the update action button.
 *
 * @param {string} text The new button text.
 * @param {boolean} disabled Optional. Disable or enable the button
 * @param {function} handler Optional. New button event handler.
 */
function settingsUpdateButtonStatus(text, disabled, handler) {
    if (disabled === void 0) { disabled = false; }
    if (handler === void 0) { handler = null; }
    settingsUpdateActionButton.innerHTML = text;
    settingsUpdateActionButton.disabled = disabled;
    if (handler != null) {
        settingsUpdateActionButton.onclick = handler;
    }
}
/**
 * Populate the update tab with relevant information.
 *
 * @param {Object} data The update data.
 */
function populateSettingsUpdateInformation(data) {
    if (data != null) {
        settingsUpdateTitle.innerHTML = "New " + (isPrerelease(data.version) ? 'Pre-release' : 'Release') + " Available";
        settingsUpdateChangelogCont.style.display = null;
        settingsUpdateChangelogTitle.innerHTML = data.releaseName;
        settingsUpdateChangelogText.innerHTML = data.releaseNotes;
        populateVersionInformation(data.version, settingsUpdateVersionValue, settingsUpdateVersionTitle, settingsUpdateVersionCheck);
        if (process.platform === 'darwin') {
            settingsUpdateButtonStatus('Download from GitHub<span style="font-size: 10px;color: gray;text-shadow: none !important;">Close the launcher and run the dmg to update.</span>', false, function () {
                shell.openExternal(data.darwindownload);
            });
        }
        else {
            settingsUpdateButtonStatus('Downloading..', true);
        }
    }
    else {
        settingsUpdateTitle.innerHTML = 'You Are Running the Latest Version';
        settingsUpdateChangelogCont.style.display = 'none';
        populateVersionInformation(remote.app.getVersion(), settingsUpdateVersionValue, settingsUpdateVersionTitle, settingsUpdateVersionCheck);
        settingsUpdateButtonStatus('Check for Updates', false, function () {
            if (!isDev) {
                ipcRenderer.send('autoUpdateAction', 'checkForUpdate');
                settingsUpdateButtonStatus('Checking for Updates..', true);
            }
        });
    }
}
/**
 * Prepare update tab for display.
 *
 * @param {Object} data The update data.
 */
function prepareUpdateTab(data) {
    if (data === void 0) { data = null; }
    populateSettingsUpdateInformation(data);
}
/**
 * Settings preparation functions.
 */
/**
  * Prepare the entire settings UI.
  *
  * @param {boolean} first Whether or not it is the first load.
  */
function prepareSettings(first) {
    if (first === void 0) { first = false; }
    if (first) {
        setupSettingsTabs();
        initSettingsValidators();
        prepareUpdateTab();
    }
    else {
        prepareModsTab();
    }
    initSettingsValues();
    prepareAccountsTab();
    prepareJavaTab();
    prepareAboutTab();
}
// Prepare the settings UI on startup.
//prepareSettings(true)
