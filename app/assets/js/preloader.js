var ipcRenderer = require('electron').ipcRenderer;
var fs = require('fs-extra');
var fsold = require('fs');
var os = require('os');
var path = require('path');
var got = require('got');
var ConfigManager = require('./configmanager');
var DistroManager = require('./distromanager');
var LangLoader = require('./langloader');
var LoggerUtils = require('./loggerutil');
var logger = LoggerUtils('%c[Preloader]', 'color: #a02d2a; font-weight: bold');
var DiscordWrapper = require('./discordwrapper');
logger.log('Loading..');
fsold.unlinkSync(ConfigManager.getLauncherDirectory() + '/latest.log');
// Load ConfigManager
ConfigManager.load();
// Load Strings
LangLoader.loadLanguage('en_US');
function onDistroLoad(data) {
    if (data != null) {
        // Resolve the selected server if its value has yet to be set.
        if (ConfigManager.getSelectedServer() == null || data.getServer(ConfigManager.getSelectedServer()) == null) {
            logger.log('Determining default selected server..');
            ConfigManager.setSelectedServer(data.getMainServer().getID());
            ConfigManager.save();
        }
    }
    ipcRenderer.send('distributionIndexDone', data != null);
    var distro = DistroManager.getDistribution();
    if (distro.discord != null) {
        DiscordWrapper.initRPC(distro.discord, 'In the Launcher', new Date().getTime());
    }
}
try {
    got('https://mysql.songs-of-war.com/maintenance').then(function (result) {
        if (result.body == 'true') {
            onDistroLoad(null);
            console.log('Server maintenance true');
        }
        else {
            console.log('Server maintenance false');
            // Ensure Distribution is downloaded and cached.
            DistroManager.pullRemote().then(function (data) {
                logger.log('Loaded distribution index.');
                onDistroLoad(data);
            }).catch(function (err) {
                logger.log('Failed to load distribution index.');
                logger.error(err);
                onDistroLoad(null);
            });
            // Clean up temp dir incase previous launches ended unexpectedly. 
            fs.remove(path.join(os.tmpdir(), ConfigManager.getTempNativeFolder()), function (err) {
                if (err) {
                    logger.warn('Error while cleaning natives directory', err);
                }
                else {
                    logger.log('Cleaned natives directory.');
                }
            });
        }
    });
}
catch (error) {
    console.error(error);
    onDistroLoad(null);
}
