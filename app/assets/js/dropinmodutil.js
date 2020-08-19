var fs = require('fs-extra');
var path = require('path');
var shell = require('electron').shell;
// Group #1: File Name (without .disabled, if any)
// Group #2: File Extension (jar, zip, or litemod)
// Group #3: If it is disabled (if string 'disabled' is present)
var MOD_REGEX = /^(.+(jar|zip|litemod))(?:\.(disabled))?$/;
var DISABLED_EXT = '.disabled';
var SHADER_REGEX = /^(.+)\.zip$/;
var SHADER_OPTION = /shaderPack=(.+)/;
var SHADER_DIR = 'shaderpacks';
var SHADER_CONFIG = 'optionsshaders.txt';
/**
 * Validate that the given directory exists. If not, it is
 * created.
 *
 * @param {string} modsDir The path to the mods directory.
 */
exports.validateDir = function (dir) {
    fs.ensureDirSync(dir);
};
/**
 * Scan for drop-in mods in both the mods folder and version
 * safe mods folder.
 *
 * @param {string} modsDir The path to the mods directory.
 * @param {string} version The minecraft version of the server configuration.
 *
 * @returns {{fullName: string, name: string, ext: string, disabled: boolean}[]}
 * An array of objects storing metadata about each discovered mod.
 */
exports.scanForDropinMods = function (modsDir, version) {
    var modsDiscovered = [];
    if (fs.existsSync(modsDir)) {
        var modCandidates = fs.readdirSync(modsDir);
        var verCandidates = [];
        var versionDir = path.join(modsDir, version);
        if (fs.existsSync(versionDir)) {
            verCandidates = fs.readdirSync(versionDir);
        }
        for (var _i = 0, modCandidates_1 = modCandidates; _i < modCandidates_1.length; _i++) {
            var file = modCandidates_1[_i];
            var match = MOD_REGEX.exec(file);
            if (match != null) {
                fs.unlinkSync(modsDir + '/' + file);
            }
        }
        for (var _a = 0, verCandidates_1 = verCandidates; _a < verCandidates_1.length; _a++) {
            var file = verCandidates_1[_a];
            var match = MOD_REGEX.exec(file);
            if (match != null) {
                fs.unlinkSync(modsDir + '/' + file);
            }
        }
    }
    return modsDiscovered;
};
/**
 * Add dropin mods.
 *
 * @param {FileList} files The files to add.
 * @param {string} modsDir The path to the mods directory.
 */
exports.addDropinMods = function (files, modsdir) {
    exports.validateDir(modsdir);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var f = files_1[_i];
        if (MOD_REGEX.exec(f.name) != null) {
            fs.moveSync(f.path, path.join(modsdir, f.name));
        }
    }
};
/**
 * Delete a drop-in mod from the file system.
 *
 * @param {string} modsDir The path to the mods directory.
 * @param {string} fullName The fullName of the discovered mod to delete.
 *
 * @returns {boolean} True if the mod was deleted, otherwise false.
 */
exports.deleteDropinMod = function (modsDir, fullName) {
    var res = shell.moveItemToTrash(path.join(modsDir, fullName));
    if (!res) {
        shell.beep();
    }
    return res;
};
/**
 * Toggle a discovered mod on or off. This is achieved by either
 * adding or disabling the .disabled extension to the local file.
 *
 * @param {string} modsDir The path to the mods directory.
 * @param {string} fullName The fullName of the discovered mod to toggle.
 * @param {boolean} enable Whether to toggle on or off the mod.
 *
 * @returns {Promise.<void>} A promise which resolves when the mod has
 * been toggled. If an IO error occurs the promise will be rejected.
 */
exports.toggleDropinMod = function (modsDir, fullName, enable) {
    return new Promise(function (resolve, reject) {
        var oldPath = path.join(modsDir, fullName);
        var newPath = path.join(modsDir, enable ? fullName.substring(0, fullName.indexOf(DISABLED_EXT)) : fullName + DISABLED_EXT);
        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
/**
 * Check if a drop-in mod is enabled.
 *
 * @param {string} fullName The fullName of the discovered mod to toggle.
 * @returns {boolean} True if the mod is enabled, otherwise false.
 */
exports.isDropinModEnabled = function (fullName) {
    return !fullName.endsWith(DISABLED_EXT);
};
/**
 * Scan for shaderpacks inside the shaderpacks folder.
 *
 * @param {string} instanceDir The path to the server instance directory.
 *
 * @returns {{fullName: string, name: string}[]}
 * An array of objects storing metadata about each discovered shaderpack.
 */
exports.scanForShaderpacks = function (instanceDir) {
    var shaderDir = path.join(instanceDir, SHADER_DIR);
    var packsDiscovered = [{
            fullName: 'OFF',
            name: 'Off (Default)'
        }];
    if (fs.existsSync(shaderDir)) {
        var modCandidates = fs.readdirSync(shaderDir);
        for (var _i = 0, modCandidates_2 = modCandidates; _i < modCandidates_2.length; _i++) {
            var file = modCandidates_2[_i];
            var match = SHADER_REGEX.exec(file);
            if (match != null) {
                packsDiscovered.push({
                    fullName: match[0],
                    name: match[1]
                });
            }
        }
    }
    return packsDiscovered;
};
/**
 * Read the optionsshaders.txt file to locate the current
 * enabled pack. If the file does not exist, OFF is returned.
 *
 * @param {string} instanceDir The path to the server instance directory.
 *
 * @returns {string} The file name of the enabled shaderpack.
 */
exports.getEnabledShaderpack = function (instanceDir) {
    exports.validateDir(instanceDir);
    var optionsShaders = path.join(instanceDir, SHADER_CONFIG);
    if (fs.existsSync(optionsShaders)) {
        var buf = fs.readFileSync(optionsShaders, { encoding: 'utf-8' });
        var match = SHADER_OPTION.exec(buf);
        if (match != null) {
            return match[1];
        }
        else {
            console.warn('WARNING: Shaderpack regex failed.');
        }
    }
    return 'OFF';
};
/**
 * Set the enabled shaderpack.
 *
 * @param {string} instanceDir The path to the server instance directory.
 * @param {string} pack the file name of the shaderpack.
 */
exports.setEnabledShaderpack = function (instanceDir, pack) {
    exports.validateDir(instanceDir);
    var optionsShaders = path.join(instanceDir, SHADER_CONFIG);
    var buf;
    if (fs.existsSync(optionsShaders)) {
        buf = fs.readFileSync(optionsShaders, { encoding: 'utf-8' });
        buf = buf.replace(SHADER_OPTION, "shaderPack=" + pack);
    }
    else {
        buf = "shaderPack=" + pack;
    }
    fs.writeFileSync(optionsShaders, buf, { encoding: 'utf-8' });
};
/**
 * Add shaderpacks.
 *
 * @param {FileList} files The files to add.
 * @param {string} instanceDir The path to the server instance directory.
 */
exports.addShaderpacks = function (files, instanceDir) {
    var p = path.join(instanceDir, SHADER_DIR);
    exports.validateDir(p);
    for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
        var f = files_2[_i];
        if (SHADER_REGEX.exec(f.name) != null) {
            fs.moveSync(f.path, path.join(p, f.name));
        }
    }
};
