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
 * AuthManager
 *
 * This module aims to abstract login procedures. Results from Mojang's REST api
 * are retrieved through our Mojang module. These results are processed and stored,
 * if applicable, in the config using the ConfigManager. All login procedures should
 * be made through this module.
 *
 * @module authmanager
 */
// Requirements
var ConfigManager = require('./configmanager');
var LoggerUtil = require('./loggerutil');
var Mojang = require('./mojang');
var logger = LoggerUtil('%c[AuthManager]', 'color: #a02d2a; font-weight: bold');
var loggerSuccess = LoggerUtil('%c[AuthManager]', 'color: #209b07; font-weight: bold');
// Functions
/**
 * Add an account. This will authenticate the given credentials with Mojang's
 * authserver. The resultant data will be stored as an auth account in the
 * configuration database.
 *
 * @param {string} username The account username (email if migrated).
 * @param {string} password The account password.
 * @returns {Promise.<Object>} Promise which resolves the resolved authenticated account object.
 */
exports.addAccount = function (username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var session, ret, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Mojang.authenticate(username, password, ConfigManager.getClientToken())];
                case 1:
                    session = _a.sent();
                    if (session.selectedProfile != null) {
                        ret = ConfigManager.addAuthAccount(session.selectedProfile.id, session.accessToken, username, session.selectedProfile.name);
                        if (ConfigManager.getClientToken() == null) {
                            ConfigManager.setClientToken(session.clientToken);
                        }
                        ConfigManager.save();
                        return [2 /*return*/, ret];
                    }
                    else {
                        throw new Error('NotPaidAccount');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, Promise.reject(err_1)];
                case 3: return [2 /*return*/];
            }
        });
    });
};
/**
 * Remove an account. This will invalidate the access token associated
 * with the account and then remove it from the database.
 *
 * @param {string} uuid The UUID of the account to be removed.
 * @returns {Promise.<void>} Promise which resolves to void when the action is complete.
 */
exports.removeAccount = function (uuid) {
    return __awaiter(this, void 0, void 0, function () {
        var authAcc, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    authAcc = ConfigManager.getAuthAccount(uuid);
                    return [4 /*yield*/, Mojang.invalidate(authAcc.accessToken, ConfigManager.getClientToken())];
                case 1:
                    _a.sent();
                    ConfigManager.removeAuthAccount(uuid);
                    ConfigManager.save();
                    return [2 /*return*/, Promise.resolve()];
                case 2:
                    err_2 = _a.sent();
                    return [2 /*return*/, Promise.reject(err_2)];
                case 3: return [2 /*return*/];
            }
        });
    });
};
/**
 * Validate the selected account with Mojang's authserver. If the account is not valid,
 * we will attempt to refresh the access token and update that value. If that fails, a
 * new login will be required.
 *
 * **Function is WIP**
 *
 * @returns {Promise.<boolean>} Promise which resolves to true if the access token is valid,
 * otherwise false.
 */
exports.validateSelected = function () {
    return __awaiter(this, void 0, void 0, function () {
        var current, isValid, session, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    current = ConfigManager.getSelectedAccount();
                    return [4 /*yield*/, Mojang.validate(current.accessToken, ConfigManager.getClientToken())];
                case 1:
                    isValid = _a.sent();
                    if (!!isValid) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, Mojang.refresh(current.accessToken, ConfigManager.getClientToken())];
                case 3:
                    session = _a.sent();
                    ConfigManager.updateAuthAccount(current.uuid, session.accessToken);
                    ConfigManager.save();
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _a.sent();
                    logger.debug('Error while validating selected profile:', err_3);
                    if (err_3 && err_3.error === 'ForbiddenOperationException') {
                        // What do we do?
                    }
                    logger.log('Account access token is invalid.');
                    return [2 /*return*/, false];
                case 5:
                    loggerSuccess.log('Account access token validated.');
                    return [2 /*return*/, true];
                case 6:
                    loggerSuccess.log('Account access token validated.');
                    return [2 /*return*/, true];
            }
        });
    });
};
