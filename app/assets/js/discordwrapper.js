// Work in progress
var logger = require('./loggerutil')('%c[DiscordWrapper]', 'color: #7289da; font-weight: bold');
var Client = require('discord-rpc').Client;
var LastDate = null;
var isRPCEnabled = false;
var client;
var activity;
exports.initRPC = function (genSettings, initialDetails, startTimestampDate) {
    if (initialDetails === void 0) { initialDetails = 'In the Launcher'; }
    if (startTimestampDate === void 0) { startTimestampDate = null; }
    client = new Client({ transport: 'ipc' });
    // Male sure to not reset the time when the argument isn't passed
    if (startTimestampDate != null) {
        LastDate = startTimestampDate;
    }
    activity = {
        details: initialDetails,
        state: 'Server',
        largeImageKey: 'sealcircle',
        largeImageText: 'songs-of-war.com',
        smallImageKey: genSettings.smallImageKey,
        smallImageText: genSettings.smallImageText,
        partySize: 0,
        partyMax: 0,
        startTimestamp: LastDate,
        instance: false
    };
    client.on('ready', function () {
        logger.log('Discord RPC Connected');
        client.setActivity(activity);
        isRPCEnabled = true;
    });
    client.login({ clientId: genSettings.clientId }).catch(function (error) {
        if (error.message.includes('ENOENT')) {
            logger.log('Unable to initialize Discord Rich Presence, no client detected.');
        }
        else {
            logger.log('Unable to initialize Discord Rich Presence: ' + error.message, error);
        }
    });
};
exports.updateOC = function (ocName, ocSpecies, imageKey) {
    if (!isRPCEnabled)
        return;
    activity.smallImageKey = imageKey;
    activity.smallImageText = ocSpecies + ' OC: ' + ocName;
    client.setActivity(activity);
};
exports.resetOC = function () {
    if (!isRPCEnabled)
        return;
    activity.smallImageKey = 'mainlogo';
    activity.smallImageText = 'Songs of War';
    client.setActivity(activity);
};
exports.updateDetails = function (details, startimestamp) {
    if (startimestamp === void 0) { startimestamp = null; }
    if (!isRPCEnabled)
        return;
    activity.details = details;
    if (startimestamp != null) {
        LastDate = startimestamp;
    }
    if (details == 'In the Launcher') {
        exports.resetOC();
    }
    activity.startTimestamp = LastDate;
    client.setActivity(activity);
};
exports.updatePartySize = function (curPlayers, maxPlayers) {
    if (curPlayers === void 0) { curPlayers = 0; }
    if (maxPlayers === void 0) { maxPlayers = 0; }
    if (!isRPCEnabled)
        return;
    activity.partyMax = maxPlayers;
    activity.partySize = curPlayers;
    client.setActivity(activity);
};
exports.shutdownRPC = function () {
    if (!client)
        return;
    client.clearActivity();
    client.destroy();
    client = null;
    activity = null;
};
