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
 * Script for landing.ejs
 */
// Requirements
var cp = require('child_process');
var crypto = require('crypto');
var URL = require('url').URL;
var fs = require('fs');
var got = require('got');
var _a = require('electron'), app = _a.app, ipcMain = _a.ipcMain;
// Internal Requirements
var DiscordWrapper = require('./assets/js/discordwrapper');
var Mojang = require('./assets/js/mojang');
var ProcessBuilder = require('./assets/js/processbuilder');
var ServerStatus = require('./assets/js/serverstatus');
var report = require('process').report;
// Launch Elements
var launch_content = document.getElementById('launch_content');
var launch_details = document.getElementById('launch_details');
var launch_progress = document.getElementById('launch_progress');
var launch_progress_label = document.getElementById('launch_progress_label');
var launch_details_text = document.getElementById('launch_details_text');
var server_selection_button = document.getElementById('server_selection_button');
var user_text = document.getElementById('user_text');
// Variable for checking if the user joined the server
var joinedServer = false;
var loggerLanding = LoggerUtil('%c[Landing]', 'color: #000668; font-weight: bold');
/* Launch Progress Wrapper Functions */
/**
 * Show/hide the loading area.
 *
 * @param {boolean} loading True if the loading area should be shown, otherwise false.
 */
function toggleLaunchArea(loading) {
    if (loading) {
        launch_details.style.display = 'flex';
        launch_content.style.display = 'none';
    }
    else {
        launch_details.style.display = 'none';
        launch_content.style.display = 'inline-flex';
    }
}
/**
 * Set the details text of the loading area.
 *
 * @param {string} details The new text for the loading details.
 */
function setLaunchDetails(details) {
    launch_details_text.innerHTML = details;
}
/**
 * Set the value of the loading progress bar and display that value.
 *
 * @param {number} value The progress value.
 * @param {number} max The total size.
 * @param {number|string} percent Optional. The percentage to display on the progress label.
 */
function setLaunchPercentage(value, max, percent) {
    if (percent === void 0) { percent = ((value / max) * 100); }
    launch_progress.setAttribute('max', max);
    launch_progress.setAttribute('value', value);
    launch_progress_label.innerHTML = percent + '%';
}
/**
 * Set the value of the OS progress bar and display that on the UI.
 *
 * @param {number} value The progress value.
 * @param {number} max The total download size.
 * @param {number|string} percent Optional. The percentage to display on the progress label.
 */
function setDownloadPercentage(value, max, percent) {
    if (percent === void 0) { percent = ((value / max) * 100); }
    remote.getCurrentWindow().setProgressBar(value / max);
    setLaunchPercentage(value, max, percent);
}
/**
 * Enable or disable the launch button.
 *
 * @param {boolean} val True to enable, false to disable.
 */
function setLaunchEnabled(val) {
    document.getElementById('launch_button').disabled = !val;
}
// Bind launch button
document.getElementById('launch_button').addEventListener('click', function (e) {
    loggerLanding.log('Launching game..');
    DiscordWrapper.updateDetails('Preparing to launch...', new Date().getTime());
    var mcVersion = DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer()).getMinecraftVersion();
    var jExe = ConfigManager.getJavaExecutable();
    if (jExe == null) {
        asyncSystemScan(mcVersion);
    }
    else {
        setLaunchDetails(Lang.queryJS('landing.launch.pleaseWait'));
        toggleLaunchArea(true);
        setLaunchPercentage(0, 100);
        var jg = new JavaGuard(mcVersion);
        jg._validateJavaBinary(jExe).then(function (v) {
            loggerLanding.log('Java version meta', v);
            if (v.valid) {
                dlAsync();
            }
            else {
                asyncSystemScan(mcVersion);
            }
        });
    }
});
// Bind settings button
document.getElementById('settingsMediaButton').onclick = function (e) {
    prepareSettings();
    switchView(getCurrentView(), VIEWS.settings);
};
// Bind screnshots button
document.getElementById('screenshotsMediaButton').onclick = function (e) {
    var screenshotsPath = path.join(ConfigManager.getInstanceDirectory(), DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer()).getID(), 'screenshots');
    if (fs.existsSync(screenshotsPath)) {
        shell.openPath(screenshotsPath);
    }
    else {
        setOverlayContent('File Error', 'The screenshots folder could not be found. Try taking your first screenshot before attempting to open it.', 'Okay');
        setOverlayHandler(null);
        toggleOverlay(true);
    }
};
// Bind avatar overlay button.
document.getElementById('avatarOverlay').onclick = function (e) {
    prepareSettings();
    switchView(getCurrentView(), VIEWS.settings, 500, 500, function () {
        settingsNavItemListener(document.getElementById('settingsNavAccount'), false);
    });
};
// Bind selected account
function updateSelectedAccount(authUser) {
    var username = 'No Account Selected';
    if (authUser != null) {
        if (authUser.displayName != null) {
            username = authUser.displayName;
        }
        if (authUser.uuid != null) {
            document.getElementById('avatarContainer').style.backgroundImage = "url('https://crafatar.com/renders/body/" + authUser.uuid + "?overlay')";
        }
    }
    user_text.innerHTML = username;
}
updateSelectedAccount(ConfigManager.getSelectedAccount());
// Bind selected server
function updateSelectedServer(serv) {
    if (getCurrentView() === VIEWS.settings) {
        saveAllModConfigurations();
    }
    ConfigManager.setSelectedServer(serv != null ? serv.getID() : null);
    ConfigManager.save();
    server_selection_button.innerHTML = '\u2022 ' + (serv != null ? serv.getName() : 'No Server Selected');
    if (getCurrentView() === VIEWS.settings) {
        animateModsTabRefresh();
    }
    setLaunchEnabled(serv != null);
}
// Real text is set in uibinder.js on distributionIndexDone.
server_selection_button.innerHTML = '\u2022 Loading..';
server_selection_button.onclick = function (e) {
    e.target.blur();
    toggleServerSelection(true);
};
// Update Mojang Status Color
/*const refreshMojangStatuses = async function(){
    loggerLanding.log('Refreshing Mojang Statuses..')

    let allowchecking = false

    if(!allowchecking) {

        let status = 'grey'
        let tooltipEssentialHTML = ''
        let tooltipNonEssentialHTML = ''

        try {
            const statuses = await Mojang.status()
            greenCount = 0
            greyCount = 0

            for(let i=0; i<statuses.length; i++){
                const service = statuses[i]

                if(service.essential){
                    tooltipEssentialHTML += `<div class="mojangStatusContainer">
                        <span class="mojangStatusIcon" style="color: ${Mojang.statusToHex(service.status)};">&#8226;</span>
                        <span class="mojangStatusName">${service.name}</span>
                    </div>`
                } else {
                    tooltipNonEssentialHTML += `<div class="mojangStatusContainer">
                        <span class="mojangStatusIcon" style="color: ${Mojang.statusToHex(service.status)};">&#8226;</span>
                        <span class="mojangStatusName">${service.name}</span>
                    </div>`
                }

                if(service.status === 'yellow' && status !== 'red'){
                    status = 'yellow'
                } else if(service.status === 'red'){
                    status = 'red'
                } else {
                    if(service.status === 'grey'){
                        ++greyCount
                    }
                    ++greenCount
                }

            }

            if(greenCount === statuses.length){
                if(greyCount === statuses.length){
                    status = 'grey'
                } else {
                    status = 'green'
                }
            }

        } catch (err) {
            loggerLanding.warn('Unable to refresh Mojang service status.')
            loggerLanding.debug(err)
        }
    }
    
    //document.getElementById('mojangStatusEssentialContainer').innerHTML = tooltipEssentialHTML
    //document.getElementById('mojangStatusNonEssentialContainer').innerHTML = tooltipNonEssentialHTML
    //document.getElementById('mojang_status_icon').style.color = Mojang.statusToHex(status)
}*/
var refreshServerStatus = function (fade) {
    if (fade === void 0) { fade = false; }
    return __awaiter(this, void 0, void 0, function () {
        var serv, pLabel, pVal, serverURL, servStat, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loggerLanding.log('Refreshing Server Status');
                    serv = DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer());
                    pLabel = 'SERVER';
                    pVal = 'OFFLINE';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    serverURL = new URL('my://' + serv.getAddress());
                    return [4 /*yield*/, ServerStatus.getStatus(serverURL.hostname, serverURL.port)];
                case 2:
                    servStat = _a.sent();
                    if (servStat.online) {
                        pLabel = 'PLAYERS';
                        pVal = servStat.onlinePlayers + '/' + servStat.maxPlayers;
                        DiscordWrapper.updatePartySize(parseInt(servStat.onlinePlayers), parseInt(servStat.maxPlayers));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    loggerLanding.warn('Unable to refresh server status, assuming offline. ' + err_1);
                    return [3 /*break*/, 4];
                case 4:
                    if (fade) {
                        $('#server_status_wrapper').fadeOut(250, function () {
                            document.getElementById('landingPlayerLabel').innerHTML = pLabel;
                            document.getElementById('player_count').innerHTML = pVal;
                            $('#server_status_wrapper').fadeIn(500);
                        });
                    }
                    else {
                        document.getElementById('landingPlayerLabel').innerHTML = pLabel;
                        document.getElementById('player_count').innerHTML = pVal;
                    }
                    return [2 /*return*/];
            }
        });
    });
};
var responsecache;
var refreshRPC = function () {
    return __awaiter(this, void 0, void 0, function () {
        var uuid, response, imageKey, species, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!joinedServer)
                        return [2 /*return*/];
                    uuid = ConfigManager.getSelectedAccount().uuid;
                    uuid = uuid.substring(0, 8) + '-' + uuid.substring(8, 12) + '-' + uuid.substring(12, 16) + '-' + uuid.substring(16, 20) + '-' + uuid.substring(20, 32);
                    if (uuid.length !== 36) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, got('https://mysql.songs-of-war.com/api/index.php?PlayerUUID=' + uuid)];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, JSON.parse(response.body)];
                case 3:
                    response = _a.sent();
                    if (response === responsecache)
                        return [2 /*return*/];
                    responsecache = response;
                    if (response.message === 'success') {
                        imageKey = response.Species;
                        species = response.Species;
                        if (typeof response.Clan === 'string') {
                            imageKey += '_' + response.Clan;
                            species = response.Clan;
                        }
                        imageKey = imageKey.toLowerCase();
                        if (response.Name !== null) {
                            DiscordWrapper.updateOC(response.Name, species, imageKey);
                        }
                        // Set location
                        if (typeof response.CurrentPosition === 'string') {
                            DiscordWrapper.updateDetails('In ' + response.CurrentPosition);
                        }
                        else {
                            //Check if user left server, since there is no way to do it through the minecraft logs this will have to do.
                            if (joinedServer) {
                                joinedServer = false;
                                DiscordWrapper.updateDetails('In the main menu', new Date().getTime());
                                DiscordWrapper.resetOC();
                            }
                        }
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    return [2 /*return*/];
                case 5: return [2 /*return*/];
            }
        });
    });
};
//refreshMojangStatuses()
// Server Status is refreshed in uibinder.js on distributionIndexDone.
// Set refresh rate to once every 5 minutes.
//let mojangStatusListener = setInterval(() => refreshMojangStatuses(true), 300000)
// Set refresh rate to once every minute since it is required for rich presence we refresh this one faster.
var serverStatusListener = setInterval(function () { return refreshServerStatus(true); }, 60000);
// Set refresh rate to every 15 seconds.
var APIPlayerInfoListener = setInterval(function () { return refreshRPC(true); }, 15000);
/**
 * Shows an error overlay, toggles off the launch area.
 *
 * @param {string} title The overlay title.
 * @param {string} desc The overlay description.
 */
function showLaunchFailure(title, desc) {
    setOverlayContent(title, desc, 'Okay');
    setOverlayHandler(null);
    toggleOverlay(true);
    toggleLaunchArea(false);
}
/**
 * Shows a non closable overlay
 *
 * @param {string} title The overlay title.
 * @param {string} desc The overlay description.
 */
function showNotClosableMessage(title, desc) {
    setOverlayContentNoButton(title, desc);
    setOverlayHandler(null);
    toggleOverlay(true);
    toggleLaunchArea(false);
}
/* System (Java) Scan */
var sysAEx;
var scanAt;
var extractListener;
/**
 * Asynchronously scan the system for valid Java installations.
 *
 * @param {string} mcVersion The Minecraft version we are scanning for.
 * @param {boolean} launchAfter Whether we should begin to launch after scanning.
 */
function asyncSystemScan(mcVersion, launchAfter) {
    if (launchAfter === void 0) { launchAfter = true; }
    setLaunchDetails('Please wait..');
    toggleLaunchArea(true);
    setLaunchPercentage(0, 100);
    var loggerSysAEx = LoggerUtil('%c[SysAEx]', 'color: #353232; font-weight: bold');
    var forkEnv = JSON.parse(JSON.stringify(process.env));
    forkEnv.CONFIG_DIRECT_PATH = ConfigManager.getLauncherDirectory();
    // Fork a process to run validations.
    sysAEx = cp.fork(path.join(__dirname, 'assets', 'js', 'assetexec.js'), [
        'JavaGuard',
        mcVersion
    ], {
        env: forkEnv,
        stdio: 'pipe'
    });
    // Stdout
    sysAEx.stdio[1].setEncoding('utf8');
    sysAEx.stdio[1].on('data', function (data) {
        loggerSysAEx.log(data);
    });
    // Stderr
    sysAEx.stdio[2].setEncoding('utf8');
    sysAEx.stdio[2].on('data', function (data) {
        loggerSysAEx.log(data);
    });
    sysAEx.on('message', function (m) {
        if (m.context === 'validateJava') {
            if (m.result == null) {
                // If the result is null, no valid Java installation was found.
                // Show this information to the user.
                setOverlayContent('No Compatible<br>Java Installation Found', 'In order to join Songs of War, you need a 64-bit installation of Java 8. Would you like us to install a copy? By installing, you accept <a href="http://www.oracle.com/technetwork/java/javase/terms/license/index.html">Oracle\'s license agreement</a>.', 'Install Java', 'Install Manually');
                setOverlayHandler(function () {
                    setLaunchDetails('Preparing Java Download..');
                    sysAEx.send({ task: 'changeContext', class: 'AssetGuard', args: [ConfigManager.getCommonDirectory(), ConfigManager.getJavaExecutable()] });
                    sysAEx.send({ task: 'execute', function: '_enqueueOpenJDK', argsArr: [ConfigManager.getDataDirectory()] });
                    toggleOverlay(false);
                });
                setDismissHandler(function () {
                    $('#overlayContent').fadeOut(250, function () {
                        //$('#overlayDismiss').toggle(false)
                        setOverlayContent('Java is Required<br>to Launch', 'A valid x64 installation of Java 8 is required to launch.', 'I Understand', 'Go Back');
                        setOverlayHandler(function () {
                            toggleLaunchArea(false);
                            toggleOverlay(false);
                        });
                        setDismissHandler(function () {
                            toggleOverlay(false, true);
                            asyncSystemScan();
                        });
                        $('#overlayContent').fadeIn(250);
                    });
                });
                toggleOverlay(true, true);
            }
            else {
                // Java installation found, use this to launch the game.
                ConfigManager.setJavaExecutable(m.result);
                ConfigManager.save();
                // We need to make sure that the updated value is on the settings UI.
                // Just incase the settings UI is already open.
                settingsJavaExecVal.value = m.result;
                populateJavaExecDetails(settingsJavaExecVal.value);
                if (launchAfter) {
                    dlAsync();
                }
                sysAEx.disconnect();
            }
        }
        else if (m.context === '_enqueueOpenJDK') {
            if (m.result === true) {
                // Oracle JRE enqueued successfully, begin download.
                setLaunchDetails('Downloading Java..');
                sysAEx.send({ task: 'execute', function: 'processDlQueues', argsArr: [[{ id: 'java', limit: 1 }]] });
            }
            else {
                // Oracle JRE enqueue failed. Probably due to a change in their website format.
                // User will have to follow the guide to install Java.
                setOverlayContent('Unexpected Issue:<br>Java Download Failed', 'Unfortunately we\'ve encountered an issue while attempting to install Java. You will need to manually install a copy.', 'I Understand');
                setOverlayHandler(function () {
                    toggleOverlay(false);
                    toggleLaunchArea(false);
                });
                toggleOverlay(true);
                sysAEx.disconnect();
            }
        }
        else if (m.context === 'progress') {
            switch (m.data) {
                case 'download':
                    // Downloading..
                    setDownloadPercentage(m.value, m.total, m.percent);
                    break;
            }
        }
        else if (m.context === 'complete') {
            switch (m.data) {
                case 'download': {
                    // Show installing progress bar.
                    remote.getCurrentWindow().setProgressBar(2);
                    // Wait for extration to complete.
                    var eLStr_1 = 'Extracting';
                    var dotStr_1 = '';
                    setLaunchDetails(eLStr_1);
                    extractListener = setInterval(function () {
                        if (dotStr_1.length >= 3) {
                            dotStr_1 = '';
                        }
                        else {
                            dotStr_1 += '.';
                        }
                        setLaunchDetails(eLStr_1 + dotStr_1);
                    }, 750);
                    break;
                }
                case 'java':
                    // Download & extraction complete, remove the loading from the OS progress bar.
                    remote.getCurrentWindow().setProgressBar(-1);
                    // Extraction completed successfully.
                    ConfigManager.setJavaExecutable(m.args[0]);
                    ConfigManager.save();
                    if (extractListener != null) {
                        clearInterval(extractListener);
                        extractListener = null;
                    }
                    setLaunchDetails('Java Installed!');
                    if (launchAfter) {
                        dlAsync();
                    }
                    sysAEx.disconnect();
                    break;
            }
        }
        else if (m.context === 'error') {
            console.log(m.error);
        }
    });
    // Begin system Java scan.
    setLaunchDetails('Checking system info..');
    sysAEx.send({ task: 'execute', function: 'validateJava', argsArr: [ConfigManager.getDataDirectory()] });
}
// Keep reference to Minecraft Process
var proc;
// Is DiscordRPC enabled
// Joined server regex
// Change this if your server uses something different.
var SERVER_JOINED_REGEX = /\[.+\]: \[CHAT\] \[\+\] [a-zA-Z0-9_]{1,16} has entered Ardonia/;
var GAME_JOINED_REGEX = /\[.+\]: Sound engine started/;
var GAME_LAUNCH_REGEX = /^\[.+\]: (?:MinecraftForge .+ Initialized|ModLauncher .+ starting: .+)$/;
var MIN_LINGER = 5000;
var aEx;
var serv;
var versionData;
var forgeData;
var progressListener;
/**
 * Use a default options.txt that comes with the launcher.
 *
 * @param {string} optionsPath - Path to instance options.txt
 */
function useDefaultOptions(optionsPath) {
    var setting = DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer()).isMainServer() ? 'normal' : 'high';
    fs.copyFileSync(path.join(__dirname, 'assets/txt', setting, 'options.txt'), optionsPath);
    fs.copyFileSync(path.join(__dirname, 'assets/txt', setting, 'optionsof.txt'), path.join(path.dirname(optionsPath), 'optionsof.txt'));
}
var GameInstanceStarted = false;
function dlAsync(login) {
    // Login parameter is temporary for debug purposes. Allows testing the validation/downloads without
    // launching the game.
    if (login === void 0) { login = true; }
    if (login) {
        if (ConfigManager.getSelectedAccount() == null) {
            loggerLanding.error('You must be logged into an account.');
            return;
        }
    }
    if (GameInstanceStarted) {
        setLaunchEnabled(false);
        toggleLaunchArea(false);
        return;
    }
    setLaunchDetails('Please wait..');
    DiscordWrapper.updateDetails('Preparing to launch...', new Date().getTime());
    toggleLaunchArea(true);
    setLaunchPercentage(0, 100);
    var loggerAEx = LoggerUtil('%c[AEx]', 'color: #353232; font-weight: bold');
    var loggerLaunchSuite = LoggerUtil('%c[LaunchSuite]', 'color: #000668; font-weight: bold');
    var forkEnv = JSON.parse(JSON.stringify(process.env));
    forkEnv.CONFIG_DIRECT_PATH = ConfigManager.getLauncherDirectory();
    // Start AssetExec to run validations and downloads in a forked process.
    aEx = cp.fork(path.join(__dirname, 'assets', 'js', 'assetexec.js'), [
        'AssetGuard',
        ConfigManager.getCommonDirectory(),
        ConfigManager.getJavaExecutable()
    ], {
        env: forkEnv,
        stdio: 'pipe'
    });
    // Stdout
    aEx.stdio[1].setEncoding('utf8');
    aEx.stdio[1].on('data', function (data) {
        loggerAEx.log(data);
    });
    // Stderr
    aEx.stdio[2].setEncoding('utf8');
    aEx.stdio[2].on('data', function (data) {
        loggerAEx.log(data);
    });
    aEx.on('error', function (err) {
        loggerLaunchSuite.error('Error during launch', err);
        DiscordWrapper.updateDetails('In the Launcher', new Date().getTime());
        showNotClosableMessage('Please wait...', 'The launcher is currently gathering information, this won\'t take long!');
        var reportdata = fs.readFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', 'utf-8');
        (function () {
            return __awaiter(this, void 0, void 0, function () {
                var body, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                setTimeout(function () { resolve(); }, 3000); //Wait 3 seconds
                            })];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, got.post('https://mysql.songs-of-war.com/reporting/reporting.php', {
                                    form: {
                                        ReportData: reportdata
                                    },
                                }).json()];
                        case 3:
                            body = _a.sent();
                            if (body['message'] == 'Success') {
                                showLaunchFailure('Error During Launch', '\nIf you require further assistance please write this code down and ask on our discord:\n' + body['ReportID']);
                            }
                            else {
                                showLaunchFailure('Error During Launch', ' \nWe were not able to make an error report automatically.');
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            err_2 = _a.sent();
                            showLaunchFailure('Error During Launch', '\nWe were not able to make an error report automatically.' + err_2);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        })();
    });
    aEx.on('close', function (code, signal) {
        if (code !== 0) {
            loggerLaunchSuite.error("AssetExec exited with code " + code + ", assuming error.");
            DiscordWrapper.updateDetails('In the Launcher', new Date().getTime());
            showNotClosableMessage('Please wait...', 'The launcher is currently gathering information, this won\'t take long!');
            var reportdata_1 = fs.readFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', 'utf-8');
            (function () {
                return __awaiter(this, void 0, void 0, function () {
                    var body, err_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    setTimeout(function () { resolve(); }, 3000); //Wait 3 seconds
                                })];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, got.post('https://mysql.songs-of-war.com/reporting/reporting.php', {
                                        form: {
                                            ReportData: reportdata_1
                                        },
                                    }).json()];
                            case 3:
                                body = _a.sent();
                                if (body['message'] == 'Success') {
                                    showLaunchFailure('Error During Launch', '\nIf you require further assistance please write this code down and ask on our discord:\n' + body['ReportID']);
                                }
                                else {
                                    showLaunchFailure('Error During Launch', ' \nWe were not able to make an error report automatically.');
                                }
                                return [3 /*break*/, 5];
                            case 4:
                                err_3 = _a.sent();
                                showLaunchFailure('Error During Launch', ' \nWe were not able to make an error report automatically. ' + err_3);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            })();
        }
    });
    // Establish communications between the AssetExec and current process.
    aEx.on('message', function (m) {
        if (m.context === 'validate') {
            switch (m.data) {
                case 'distribution':
                    setLaunchPercentage(20, 100);
                    loggerLaunchSuite.log('Validated distribution index.');
                    setLaunchDetails('Loading version information..');
                    break;
                case 'version':
                    setLaunchPercentage(40, 100);
                    loggerLaunchSuite.log('Version data loaded.');
                    setLaunchDetails('Validating asset integrity..');
                    break;
                case 'assets':
                    setLaunchPercentage(60, 100);
                    loggerLaunchSuite.log('Asset Validation Complete');
                    setLaunchDetails('Validating library integrity..');
                    break;
                case 'libraries':
                    setLaunchPercentage(80, 100);
                    loggerLaunchSuite.log('Library validation complete.');
                    setLaunchDetails('Validating miscellaneous file integrity..');
                    break;
                case 'dlforge':
                    setLaunchPercentage(35, 100);
                    loggerLaunchSuite.log('Misc file loaded.');
                    setLaunchDetails('Downloading Forge..');
                    break;
                case 'dlforgelibs':
                    setLaunchPercentage(40, 100);
                    loggerLaunchSuite.log('Forge loaded.');
                    setLaunchDetails('Downloading libraries..');
                    break;
                case 'buildingforge':
                    setLaunchPercentage(50, 100);
                    loggerLaunchSuite.log('Building forge.');
                    setLaunchDetails('Building Forge..');
                    break;
                case 'buildingforge2':
                    setLaunchPercentage(60, 100);
                    loggerLaunchSuite.log('Building Forge 2.');
                    setLaunchDetails('Building forge..');
                    break;
                case 'forgeremap':
                    setLaunchPercentage(80, 100);
                    loggerLaunchSuite.log('Remapping jar.');
                    setLaunchDetails('Remapping forge..');
                    break;
                case 'forgepatch':
                    setLaunchPercentage(80, 100);
                    loggerLaunchSuite.log('Patch jar.');
                    setLaunchDetails('Patching Forge..');
                    break;
                case 'files':
                    setLaunchPercentage(100, 100);
                    loggerLaunchSuite.log('File validation complete.');
                    setLaunchDetails('Downloading files..');
                    break;
            }
        }
        else if (m.context === 'progress') {
            switch (m.data) {
                case 'assets': {
                    var perc = (m.value / m.total) * 20;
                    setLaunchPercentage(40 + perc, 100, parseInt(40 + perc));
                    break;
                }
                case 'download':
                    setDownloadPercentage(m.value, m.total, m.percent);
                    break;
                case 'extract': {
                    // Show installing progress bar.
                    remote.getCurrentWindow().setProgressBar(2);
                    // Download done, extracting.
                    var eLStr_2 = 'Extracting libraries';
                    var dotStr_2 = '';
                    setLaunchDetails(eLStr_2);
                    progressListener = setInterval(function () {
                        if (dotStr_2.length >= 3) {
                            dotStr_2 = '';
                        }
                        else {
                            dotStr_2 += '.';
                        }
                        setLaunchDetails(eLStr_2 + dotStr_2);
                    }, 750);
                    break;
                }
            }
        }
        else if (m.context === 'complete') {
            switch (m.data) {
                case 'download':
                    // Download and extraction complete, remove the loading from the OS progress bar.
                    remote.getCurrentWindow().setProgressBar(-1);
                    if (progressListener != null) {
                        clearInterval(progressListener);
                        progressListener = null;
                    }
                    setLaunchDetails('Preparing to launch..');
                    DiscordWrapper.updateDetails('Game launching...', new Date().getTime());
                    break;
            }
        }
        else if (m.context === 'error') {
            switch (m.data) {
                case 'download':
                    loggerLaunchSuite.error('Error while downloading:', m.error);
                    DiscordWrapper.updateDetails('In the Launcher', new Date().getTime());
                    if (m.error.code === 'ENOENT') {
                        showLaunchFailure('Download Error', 'Could not connect to the file server. Ensure that you are connected to the internet and try again.');
                    }
                    else {
                        showNotClosableMessage('Please wait...', 'The launcher is currently gathering information, this won\'t take long!');
                        var reportdata_2 = fs.readFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', 'utf-8');
                        (function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var body, err_4;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                setTimeout(function () { resolve(); }, 3000); //Wait 3 seconds
                                            })];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2:
                                            _a.trys.push([2, 4, , 5]);
                                            return [4 /*yield*/, got.post('https://mysql.songs-of-war.com/reporting/reporting.php', {
                                                    form: {
                                                        ReportData: reportdata_2
                                                    },
                                                }).json()];
                                        case 3:
                                            body = _a.sent();
                                            if (body['message'] == 'Success') {
                                                showLaunchFailure('Download Error', '\nIf you require further assistance please write this code down and ask on our discord:\n' + body['ReportID']);
                                            }
                                            else {
                                                showLaunchFailure('Download Error', ' \nWe were not able to make an error report automatically.');
                                            }
                                            return [3 /*break*/, 5];
                                        case 4:
                                            err_4 = _a.sent();
                                            showLaunchFailure('Download Error', '\nWe were not able to make an error report automatically.' + err_4);
                                            return [3 /*break*/, 5];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            });
                        })();
                    }
                    remote.getCurrentWindow().setProgressBar(-1);
                    // Disconnect from AssetExec
                    aEx.disconnect();
                    break;
            }
        }
        else if (m.context === 'validateEverything') {
            var allGood = true;
            // If these properties are not defined it's likely an error.
            if (m.result.forgeData == null || m.result.versionData == null) {
                loggerLaunchSuite.error('Error during validation:', m.result);
                DiscordWrapper.updateDetails('In the Launcher', new Date().getTime());
                loggerLaunchSuite.error('Error during launch', m.result.error);
                (function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var body, err_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        setTimeout(function () { resolve(); }, 3000); //Wait 3 seconds
                                    })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, got.post('https://mysql.songs-of-war.com/reporting/reporting.php', {
                                            form: {
                                                ReportData: reportdata
                                            },
                                        }).json()];
                                case 3:
                                    body = _a.sent();
                                    if (body['message'] == 'Success') {
                                        showLaunchFailure('Error During Launch', '\nIf you require further assistance please write this code down and ask on our discord:\n' + body['ReportID']);
                                    }
                                    else {
                                        showLaunchFailure('Error During Launch', ' \nWe were not able to make an error report automatically.');
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    err_5 = _a.sent();
                                    showLaunchFailure('Error During Launch', '\nWe were not able to make an error report automatically.' + err_5);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    });
                })();
                allGood = false;
            }
            forgeData = m.result.forgeData;
            versionData = m.result.versionData;
            if (login && allGood) {
                var authUser = ConfigManager.getSelectedAccount();
                loggerLaunchSuite.log("Sending selected account (" + authUser.displayName + ") to ProcessBuilder.");
                var pb_1 = new ProcessBuilder(serv, versionData, forgeData, authUser, remote.app.getVersion());
                setLaunchDetails('Launching game..');
                var onLoadComplete_1 = function () {
                    toggleLaunchArea(false);
                    DiscordWrapper.updateDetails('Loading game...', new Date().getTime());
                    proc.stdout.on('data', gameStateChange_1);
                    proc.stdout.removeListener('data', tempListener_1);
                    proc.stderr.removeListener('data', gameErrorListener_1);
                };
                var start_1 = Date.now();
                // Attach a temporary listener to the client output.
                // Will wait for a certain bit of text meaning that
                // the client application has started, and we can hide
                // the progress bar stuff.
                var tempListener_1 = function (data) {
                    if (GAME_LAUNCH_REGEX.test(data.trim())) {
                        var diff = Date.now() - start_1;
                        if (diff < MIN_LINGER) {
                            setTimeout(onLoadComplete_1, MIN_LINGER - diff);
                        }
                        else {
                            onLoadComplete_1();
                        }
                    }
                };
                // Listener for Discord RPC.
                var gameStateChange_1 = function (data) {
                    data = data.trim();
                    if (SERVER_JOINED_REGEX.test(data)) {
                        DiscordWrapper.updateDetails('Playing on the server!', new Date().getTime());
                        joinedServer = true;
                    }
                    else if (GAME_JOINED_REGEX.test(data)) {
                        DiscordWrapper.updateDetails('In the Main Menu', new Date().getTime());
                    }
                };
                var gameErrorListener_1 = function (data) {
                    data = data.trim();
                    if (data.indexOf('Could not find or load main class net.minecraft.launchwrapper.Launch') > -1) {
                        DiscordWrapper.updateDetails('In the Launcher', new Date().getTime());
                        loggerLaunchSuite.error('Game launch failed, LaunchWrapper was not downloaded properly.');
                        (function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var body, err_6;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                setTimeout(function () { resolve(); }, 3000); //Wait 3 seconds
                                            })];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2:
                                            _a.trys.push([2, 4, , 5]);
                                            return [4 /*yield*/, got.post('https://mysql.songs-of-war.com/reporting/reporting.php', {
                                                    form: {
                                                        ReportData: reportdata
                                                    },
                                                }).json()];
                                        case 3:
                                            body = _a.sent();
                                            if (body['message'] == 'Success') {
                                                showLaunchFailure('Error During Launch', 'The main file, LaunchWrapper, failed to download properly. As a result, the game cannot launch.<br><br>To fix this issue, temporarily turn off your antivirus software and launch the game again.<br><br>If you have time, please <a href="https://github.com/Songs-of-War/Songs-Of-War-Launcher/issues">submit an issue</a> and let us know what antivirus software you use. \nIf you require further assistance please write this code down and ask on our discord:\n' + body['ReportID']);
                                            }
                                            else {
                                                showLaunchFailure('Error During Launch', 'The main file, LaunchWrapper, failed to download properly. As a result, the game cannot launch.<br><br>To fix this issue, temporarily turn off your antivirus software and launch the game again.<br><br>If you have time, please <a href="https://github.com/Songs-of-War/Songs-Of-War-Launcher/issues">submit an issue</a> and let us know what antivirus software you use. \nWe were not able to make an error report automatically.');
                                            }
                                            return [3 /*break*/, 5];
                                        case 4:
                                            err_6 = _a.sent();
                                            showLaunchFailure('Error During Launch', 'The main file, LaunchWrapper, failed to download properly. As a result, the game cannot launch.<br><br>To fix this issue, temporarily turn off your antivirus software and launch the game again.<br><br>If you have time, please <a href="https://github.com/Songs-of-War/Songs-Of-War-Launcher/issues">submit an issue</a> and let us know what antivirus software you use. \nWe were not able to make an error report automatically.' + err_6);
                                            return [3 /*break*/, 5];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            });
                        })();
                    }
                };
                try {
                    got('https://mysql.songs-of-war.com/maintenance').then(function (result) {
                        if (result.body == 'true') {
                            showLaunchFailure('Server in maintenance', 'Our data server is currently in maintenance. Likely because of an update, please try again later.');
                        }
                        else {
                            try {
                                setLaunchDetails('Done. Enjoy the server!');
                                setLaunchEnabled(false);
                                // Get the game instance
                                var gamePath = path.join(ConfigManager.getInstanceDirectory(), DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer()).getID());
                                var paths_1 = {
                                    mods: path.join(gamePath, 'mods'),
                                    options: path.join(gamePath, 'options.txt'),
                                    shaderpacks: path.join(gamePath, 'shaderpacks')
                                };
                                // Delete forbidden mods
                                if (fs.existsSync(paths_1.mods)) {
                                    fs.readdirSync(paths_1.mods).forEach(function (file) {
                                        if (!file.includes('OptiFine_1.15.2_HD_U_G1_pre30_MOD.jar')) { // Prevent optifine to be deleted here because of Java Path issues
                                            fs.unlinkSync(path.join(paths_1.mods, file));
                                        }
                                    });
                                }
                                //Setting up the default config for clients and overriding certain options required for the server
                                // If there aren't any options set so far
                                if (!fs.existsSync(paths_1.options) || !fs.existsSync(path.join(gamePath, 'optionsof.txt'))) {
                                    loggerLaunchSuite.log('Could not find options.txt in instance directory.');
                                    // Try to grab .minecraft/options.txt                 
                                    var oldOptionsPath = path.join(ConfigManager.getMinecraftDirectory(), 'options.txt');
                                    loggerLaunchSuite.log('Attempting to find ' + oldOptionsPath);
                                    if (fs.existsSync(oldOptionsPath)) {
                                        loggerLaunchSuite.log('Found! Attempting to copy.');
                                        fs.copyFileSync(oldOptionsPath, paths_1.options);
                                        // If it doesn't exist
                                    }
                                    else {
                                        useDefaultOptions(paths_1.options);
                                        loggerLaunchSuite.log('Couldn\'t find options.txt in Minecraft or launcher instance. Launcher defaults used.');
                                    }
                                }
                                // Loop through our options.txt and attempt to override
                                loggerLaunchSuite.log('Validating options...');
                                var data_1 = fs.readFileSync(paths_1.options, 'utf8').split('\n');
                                var packOn_1 = false, musicOff_1 = false, fullscreenOff_1 = false;
                                data_1.forEach(function (element, index) {
                                    if (element.startsWith('resourcePacks:')) {
                                        data_1[index] = 'resourcePacks:["mod_resources","vanilla","programer_art","file/SoWPack"]';
                                        packOn_1 = true;
                                    }
                                    else if (element.startsWith('soundCategory_music:')) {
                                        data_1[index] = 'soundCategory_music:0.0';
                                        musicOff_1 = true;
                                    }
                                    else if (element.startsWith('fullscreen:')) {
                                        data_1[index] = 'fullscreen:false';
                                        fullscreenOff_1 = true;
                                    }
                                });
                                var optifineOverrides_1 = false;
                                if (fs.existsSync(path.join(gamePath, 'optionsof.txt'))) {
                                    loggerLaunchSuite.log('Validating optifine settings');
                                    var dataof = fs.readFileSync(path.join(gamePath, 'optionsof.txt'), 'utf-8').split('\n');
                                    dataof.forEach(function (element, index) {
                                        if (element.startsWith('ofShowCapes:')) {
                                            data_1[index] = 'ofShowCapes:false';
                                            optifineOverrides_1 = true;
                                        }
                                    });
                                }
                                // If override successful
                                if (packOn_1 && musicOff_1 && fullscreenOff_1 && optifineOverrides_1) {
                                    fs.writeFileSync(paths_1.options, data_1.join('\n'));
                                    loggerLaunchSuite.log('Options validated.');
                                }
                                else {
                                    useDefaultOptions(paths_1.options);
                                    loggerLaunchSuite.log('Couldn\'t validate options. Launcher defaults used.');
                                }
                                if (ConfigManager.getShaderMirroring()) {
                                    // Grab shaders while we're at it as well
                                    var oldShadersPath_1 = path.join(ConfigManager.getMinecraftDirectory(), 'shaderpacks');
                                    // Check if there's a place to get shaders and a place to put them
                                    if (fs.existsSync(paths_1.shaderpacks) && fs.existsSync(oldShadersPath_1)) {
                                        // Find shaders in .minecraft/shaderpacks that instance doesn't have
                                        var shadersArr_1 = fs.readdirSync(paths_1.shaderpacks);
                                        fs.readdirSync(oldShadersPath_1)
                                            .filter(function (element) { return !shadersArr_1.includes(element); })
                                            .forEach(function (element) {
                                            // Attempt to copy shader
                                            try {
                                                fs.copyFileSync(path.join(oldShadersPath_1, element), path.join(paths_1.shaderpacks, element));
                                                loggerLaunchSuite.log('Copied shader ' + element.slice(0, -4) + ' to launcher instance.');
                                            }
                                            catch (error) {
                                                loggerLaunchSuite.warn('Failed to copy shader ' + element.slice(0, -4) + ' to launcher instance.');
                                            }
                                        });
                                    }
                                }
                                else {
                                    loggerLaunchSuite.log('Shader mirroring disabled in launcher config');
                                }
                                // Updated as of late: We want to delete the mods / edit the configuration right before the game is launched, so that the launcher gets the change to synchronise the files with the distribution
                                // Fixes ENOENT error without a .songsofwar folder
                                // Setup the watchers right before the process start and just after the asset checker is done
                                // Setup the different file watchers
                                // Note: I have no idea if there's a better way to do this so eh.
                                var ModsWatcher_1 = fs.watch(path.join(ConfigManager.getInstanceDirectory(), DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer()).getID() + '/mods'), {
                                    encoding: 'utf-8',
                                    recursive: true
                                });
                                var CustomAssetsWatcher_1 = fs.watch(path.join(ConfigManager.getInstanceDirectory(), DistroManager.getDistribution().getServer(ConfigManager.getSelectedServer()).getID() + '/customassets'), {
                                    encoding: 'utf-8',
                                    recursive: true
                                });
                                // Build Minecraft process.
                                // Minecraft process needs to be built after the asset checking is done, prevents game from starting with launcher errors
                                proc = pb_1.build();
                                // Bind listeners to stdout.
                                proc.stdout.on('data', tempListener_1);
                                proc.stderr.on('data', gameErrorListener_1);
                                proc.on('message', function (data) {
                                    if (data == 'MinecraftShutdown') {
                                        setLaunchEnabled(true);
                                        joinedServer = false;
                                        GameInstanceStarted = false;
                                        //Shutdown all the file watchers
                                        ModsWatcher_1.close();
                                        CustomAssetsWatcher_1.close();
                                    }
                                    else if (data == 'GameStarted') {
                                        GameInstanceStarted = true;
                                    }
                                });
                                //Receive crash message
                                proc.on('message', function (data) {
                                    if (data == 'Crashed') {
                                        setLaunchEnabled(true);
                                        joinedServer = false;
                                        showNotClosableMessage('Please wait...', 'The launcher is currently gathering information, this won\'t take long!');
                                        (function () {
                                            return __awaiter(this, void 0, void 0, function () {
                                                var reportdata, body, err_7;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                                setTimeout(function () { resolve(); }, 1000); //Wait 1 second
                                                            })];
                                                        case 1:
                                                            _a.sent();
                                                            if (!!ModifyError_1) return [3 /*break*/, 7];
                                                            reportdata = fs.readFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', 'utf-8');
                                                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                                    setTimeout(function () { resolve(); }, 3000); //Wait 3 seconds
                                                                })];
                                                        case 2:
                                                            _a.sent();
                                                            _a.label = 3;
                                                        case 3:
                                                            _a.trys.push([3, 5, , 6]);
                                                            return [4 /*yield*/, got.post('https://mysql.songs-of-war.com/reporting/reporting.php', {
                                                                    form: {
                                                                        ReportData: reportdata
                                                                    },
                                                                }).json()];
                                                        case 4:
                                                            body = _a.sent();
                                                            if (body['message'] == 'Success') {
                                                                showLaunchFailure('Game crashed', '\nIf you require further assistance please write this code down and ask on our discord:\n' + body['ReportID']);
                                                            }
                                                            else {
                                                                showLaunchFailure('Game crashed', ' \nWe were not able to make an error report automatically.');
                                                            }
                                                            return [3 /*break*/, 6];
                                                        case 5:
                                                            err_7 = _a.sent();
                                                            showLaunchFailure('Game crashed', '\nWe were not able to make an error report automatically.' + err_7);
                                                            return [3 /*break*/, 6];
                                                        case 6: return [3 /*break*/, 8];
                                                        case 7:
                                                            showLaunchFailure('Runtime error', 'A runtime error has occured, most likely due to a file edit.');
                                                            _a.label = 8;
                                                        case 8: return [2 /*return*/];
                                                    }
                                                });
                                            });
                                        })();
                                    }
                                });
                                ///This is very fucking stupid but oh well
                                var ModifyError_1 = false;
                                // Kill the process if the files get changed at runtime
                                ModsWatcher_1.on('change', function (event, filename) {
                                    loggerLanding.log('File edit: ' + filename);
                                    ModifyError_1 = true;
                                    proc.kill();
                                });
                                CustomAssetsWatcher_1.on('change', function (event, filename) {
                                    loggerLanding.log('File edit: ' + filename);
                                    ModifyError_1 = true;
                                    proc.kill();
                                });
                            }
                            catch (err) {
                                DiscordWrapper.updateDetails('In the Launcher', new Date().getTime());
                                setLaunchEnabled(true);
                                joinedServer = false;
                                showNotClosableMessage('Please wait...', 'The launcher is currently gathering information, this won\'t take long!');
                                loggerLaunchSuite.error('Error during launch', err);
                                var reportdata_3 = fs.readFileSync(ConfigManager.getLauncherDirectory() + '/latest.log', 'utf-8');
                                (function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var body, err_8;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                                                        setTimeout(function () { resolve(); }, 3000); //Wait 3 seconds
                                                    })];
                                                case 1:
                                                    _a.sent();
                                                    _a.label = 2;
                                                case 2:
                                                    _a.trys.push([2, 4, , 5]);
                                                    return [4 /*yield*/, got.post('https://mysql.songs-of-war.com/reporting/reporting.php', {
                                                            form: {
                                                                ReportData: reportdata_3
                                                            },
                                                        }).json()];
                                                case 3:
                                                    body = _a.sent();
                                                    if (body['message'] == 'Success') {
                                                        showLaunchFailure('Error During Launch', '\nIf you require further assistance please write this code down and ask on our discord:\n' + body['ReportID']);
                                                    }
                                                    else {
                                                        showLaunchFailure('Error During Launch', ' \nWe were not able to make an error report automatically.');
                                                    }
                                                    return [3 /*break*/, 5];
                                                case 4:
                                                    err_8 = _a.sent();
                                                    showLaunchFailure('Error During Launch', '\nWe were not able to make an error report automatically.' + err_8);
                                                    return [3 /*break*/, 5];
                                                case 5: return [2 /*return*/];
                                            }
                                        });
                                    });
                                })();
                            }
                        }
                    });
                }
                catch (error) {
                    error(error);
                    setLaunchEnabled(true);
                }
            }
            // Disconnect from AssetExec
            aEx.disconnect();
            setLaunchEnabled(true);
        }
    });
    // Begin Validations
    // Validate Forge files.
    setLaunchDetails('Loading server information..');
    refreshDistributionIndex(true, function (data) {
        onDistroRefresh(data);
        serv = data.getServer(ConfigManager.getSelectedServer());
        aEx.send({ task: 'execute', function: 'validateEverything', argsArr: [ConfigManager.getSelectedServer(), DistroManager.isDevMode()] });
    }, function (err) {
        loggerLaunchSuite.log('Error while fetching a fresh copy of the distribution index.', err);
        refreshDistributionIndex(false, function (data) {
            onDistroRefresh(data);
            serv = data.getServer(ConfigManager.getSelectedServer());
            aEx.send({ task: 'execute', function: 'validateEverything', argsArr: [ConfigManager.getSelectedServer(), DistroManager.isDevMode()] });
        }, function (err) {
            loggerLaunchSuite.error('Unable to refresh distribution index.', err);
            if (DistroManager.getDistribution() == null) {
                showLaunchFailure('Fatal Error', 'Could not load a copy of the distribution index.');
                // Disconnect from AssetExec
                aEx.disconnect();
            }
            else {
                serv = data.getServer(ConfigManager.getSelectedServer());
                aEx.send({ task: 'execute', function: 'validateEverything', argsArr: [ConfigManager.getSelectedServer(), DistroManager.isDevMode()] });
            }
        });
    });
}
/**
 * News Loading Functions
 */
// DOM Cache
var newsContent = document.getElementById('newsContent');
var newsArticleTitle = document.getElementById('newsArticleTitle');
var newsArticleDate = document.getElementById('newsArticleDate');
var newsArticleAuthor = document.getElementById('newsArticleAuthor');
var newsArticleComments = document.getElementById('newsArticleComments');
var newsNavigationStatus = document.getElementById('newsNavigationStatus');
var newsArticleContentScrollable = document.getElementById('newsArticleContentScrollable');
var nELoadSpan = document.getElementById('nELoadSpan');
// News slide caches.
var newsActive = false;
var newsGlideCount = 0;
/**
 * Show the news UI via a slide animation.
 *
 * @param {boolean} up True to slide up, otherwise false.
 */
function slide_(up) {
    var lCUpper = document.querySelector('#landingContainer > #upper');
    var lCLLeft = document.querySelector('#landingContainer > #lower > #left');
    var lCLCenter = document.querySelector('#landingContainer > #lower > #center');
    var lCLRight = document.querySelector('#landingContainer > #lower > #right');
    var newsBtn = document.querySelector('#landingContainer > #lower > #center #content');
    var landingContainer = document.getElementById('landingContainer');
    var newsContainer = document.querySelector('#landingContainer > #newsContainer');
    newsGlideCount++;
    if (up) {
        lCUpper.style.top = '-200vh';
        lCLLeft.style.top = '-200vh';
        lCLCenter.style.top = '-200vh';
        lCLRight.style.top = '-200vh';
        newsBtn.style.top = '130vh';
        newsContainer.style.top = '0px';
        //date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'})
        //landingContainer.style.background = 'rgba(29, 29, 29, 0.55)'
        landingContainer.style.background = 'rgba(0, 0, 0, 0.50)';
        setTimeout(function () {
            if (newsGlideCount === 1) {
                lCLCenter.style.transition = 'none';
                newsBtn.style.transition = 'none';
            }
            newsGlideCount--;
        }, 2000);
    }
    else {
        setTimeout(function () {
            newsGlideCount--;
        }, 2000);
        landingContainer.style.background = null;
        lCLCenter.style.transition = null;
        newsBtn.style.transition = null;
        newsContainer.style.top = '100%';
        lCUpper.style.top = '0px';
        lCLLeft.style.top = '0px';
        lCLCenter.style.top = '0px';
        lCLRight.style.top = '0px';
        newsBtn.style.top = '10px';
    }
}
// Bind news button.
/*document.getElementById('newsButton').onclick = () => {
    // Toggle tabbing.
    if(newsActive){
        $('#landingContainer *').removeAttr('tabindex')
        $('#newsContainer *').attr('tabindex', '-1')
    } else {
        $('#landingContainer *').attr('tabindex', '-1')
        $('#newsContainer, #newsContainer *, #lower, #lower #center *').removeAttr('tabindex')
        if(newsAlertShown){
            $('#newsButtonAlert').fadeOut(2000)
            newsAlertShown = false
            ConfigManager.setNewsCacheDismissed(true)
            ConfigManager.save()
        }
    }
    slide_(!newsActive)
    newsActive = !newsActive
}*/ //News button doesn't exist so yeet
// Array to store article meta.
var newsArr = null;
// News load animation listener.
var newsLoadingListener = null;
/**
 * Set the news loading animation.
 *
 * @param {boolean} val True to set loading animation, otherwise false.
 */
/*function setNewsLoading(val){
    if(val){
        const nLStr = 'Checking for News'
        let dotStr = '..'
        nELoadSpan.innerHTML = nLStr + dotStr
        newsLoadingListener = setInterval(() => {
            if(dotStr.length >= 3){
                dotStr = ''
            } else {
                dotStr += '.'
            }
            nELoadSpan.innerHTML = nLStr + dotStr
        }, 750)
    } else {
        if(newsLoadingListener != null){
            clearInterval(newsLoadingListener)
            newsLoadingListener = null
        }
    }
}*/ //News disabled no use for us
// Bind retry button.
newsErrorRetry.onclick = function () {
    $('#newsErrorFailed').fadeOut(250, function () {
        initNews();
        $('#newsErrorLoading').fadeIn(250);
    });
};
newsArticleContentScrollable.onscroll = function (e) {
    if (e.target.scrollTop > Number.parseFloat($('.newsArticleSpacerTop').css('height'))) {
        newsContent.setAttribute('scrolled', '');
    }
    else {
        newsContent.removeAttribute('scrolled');
    }
};
/**
 * Reload the news without restarting.
 *
 * @returns {Promise.<void>} A promise which resolves when the news
 * content has finished loading and transitioning.
 */
function reloadNews() {
    return new Promise(function (resolve, reject) {
        $('#newsContent').fadeOut(250, function () {
            $('#newsErrorLoading').fadeIn(250);
            initNews().then(function () {
                resolve();
            });
        });
    });
}
var newsAlertShown = false;
/**
 * Show the news alert indicating there is new news.
 */
function showNewsAlert() {
    newsAlertShown = true;
    $(newsButtonAlert).fadeIn(250);
}
/**
 * Initialize News UI. This will load the news and prepare
 * the UI accordingly.
 *
 * @returns {Promise.<void>} A promise which resolves when the news
 * content has finished loading and transitioning.
 */
/*function initNews(){

    return new Promise((resolve, reject) => {
        setNewsLoading(true)

        let news = {}
        loadNews().then(news => {

            newsArr = news.articles || null

            if(newsArr == null){
                // News Loading Failed
                setNewsLoading(false)

                $('#newsErrorLoading').fadeOut(250, () => {
                    $('#newsErrorFailed').fadeIn(250, () => {
                        resolve()
                    })
                })
            } else if(newsArr.length === 0) {
                // No News Articles
                setNewsLoading(false)

                ConfigManager.setNewsCache({
                    date: null,
                    content: null,
                    dismissed: false
                })
                ConfigManager.save()

                $('#newsErrorLoading').fadeOut(250, () => {
                    $('#newsErrorNone').fadeIn(250, () => {
                        resolve()
                    })
                })
            } else {
                // Success
                setNewsLoading(false)

                const lN = newsArr[0]
                const cached = ConfigManager.getNewsCache()
                let newHash = crypto.createHash('sha1').update(lN.content).digest('hex')
                let newDate = new Date(lN.date)
                let isNew = false

                if(cached.date != null && cached.content != null){

                    if(new Date(cached.date) >= newDate){

                        // Compare Content
                        if(cached.content !== newHash){
                            isNew = true
                            showNewsAlert()
                        } else {
                            if(!cached.dismissed){
                                isNew = true
                                showNewsAlert()
                            }
                        }

                    } else {
                        isNew = true
                        showNewsAlert()
                    }

                } else {
                    isNew = true
                    showNewsAlert()
                }

                if(isNew){
                    ConfigManager.setNewsCache({
                        date: newDate.getTime(),
                        content: newHash,
                        dismissed: false
                    })
                    ConfigManager.save()
                }

                const switchHandler = (forward) => {
                    let cArt = parseInt(newsContent.getAttribute('article'))
                    let nxtArt = forward ? (cArt >= newsArr.length-1 ? 0 : cArt + 1) : (cArt <= 0 ? newsArr.length-1 : cArt - 1)
            
                    displayArticle(newsArr[nxtArt], nxtArt+1)
                }

                document.getElementById('newsNavigateRight').onclick = () => { switchHandler(true) }
                document.getElementById('newsNavigateLeft').onclick = () => { switchHandler(false) }

                $('#newsErrorContainer').fadeOut(250, () => {
                    displayArticle(newsArr[0], 1)
                    $('#newsContent').fadeIn(250, () => {
                        resolve()
                    })
                })
            }

        })
        
    })
}*/ //Disable news, no use for us
/**
 * Add keyboard controls to the news UI. Left and right arrows toggle
 * between articles. If you are on the landing page, the up arrow will
 * open the news UI.
 */
document.addEventListener('keydown', function (e) {
    if (newsActive) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            document.getElementById(e.key === 'ArrowRight' ? 'newsNavigateRight' : 'newsNavigateLeft').click();
        }
        // Interferes with scrolling an article using the down arrow.
        // Not sure of a straight forward solution at this point.
        // if(e.key === 'ArrowDown'){
        //     document.getElementById('newsButton').click()
        // }
    }
    else {
        if (getCurrentView() === VIEWS.landing) {
            if (e.key === 'ArrowUp') {
                document.getElementById('newsButton').click();
            }
        }
    }
});
/**
 * Display a news article on the UI.
 *
 * @param {Object} articleObject The article meta object.
 * @param {number} index The article index.
 */
function displayArticle(articleObject, index) {
    newsArticleTitle.innerHTML = articleObject.title;
    newsArticleTitle.href = articleObject.link;
    newsArticleAuthor.innerHTML = 'by ' + articleObject.author;
    newsArticleDate.innerHTML = articleObject.date;
    newsArticleComments.innerHTML = articleObject.comments;
    newsArticleComments.href = articleObject.commentsLink;
    newsArticleContentScrollable.innerHTML = '<div id="newsArticleContentWrapper"><div class="newsArticleSpacerTop"></div>' + articleObject.content + '<div class="newsArticleSpacerBot"></div></div>';
    Array.from(newsArticleContentScrollable.getElementsByClassName('bbCodeSpoilerButton')).forEach(function (v) {
        v.onclick = function () {
            var text = v.parentElement.getElementsByClassName('bbCodeSpoilerText')[0];
            text.style.display = text.style.display === 'block' ? 'none' : 'block';
        };
    });
    newsNavigationStatus.innerHTML = index + ' of ' + newsArr.length;
    newsContent.setAttribute('article', index - 1);
}
/**
 * Load news information from the RSS feed specified in the
 * distribution index.
 */
function loadNews() {
    return new Promise(function (resolve, reject) {
        var distroData = DistroManager.getDistribution();
        var newsFeed = distroData.getRSS();
        var newsHost = new URL(newsFeed).origin + '/';
        $.ajax({
            url: newsFeed,
            success: function (data) {
                var items = $(data).find('item');
                var articles = [];
                for (var i = 0; i < items.length; i++) {
                    // JQuery Element
                    var el = $(items[i]);
                    // Resolve date.
                    var date = new Date(el.find('pubDate').text()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
                    // Resolve comments.
                    var comments = el.find('slash\\:comments').text() || '0';
                    comments = comments + ' Comment' + (comments === '1' ? '' : 's');
                    // Fix relative links in content.
                    var content = el.find('content\\:encoded').text();
                    var regex = /src="(?!http:\/\/|https:\/\/)(.+?)"/g;
                    var matches = void 0;
                    while ((matches = regex.exec(content))) {
                        content = content.replace("\"" + matches[1] + "\"", "\"" + (newsHost + matches[1]) + "\"");
                    }
                    var link = el.find('link').text();
                    var title = el.find('title').text();
                    var author = el.find('dc\\:creator').text();
                    // Generate article.
                    articles.push({
                        link: link,
                        title: title,
                        date: date,
                        author: author,
                        content: content,
                        comments: comments,
                        commentsLink: link + '#comments'
                    });
                }
                resolve({
                    articles: articles
                });
            },
            timeout: 2500
        }).catch(function (err) {
            resolve({
                articles: null
            });
        });
    });
}
