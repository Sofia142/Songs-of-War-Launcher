'use strict';
var getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
var isEnvSet = 'ELECTRON_IS_DEV' in process.env;
module.exports = false; //isEnvSet ? getFromEnv : (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath))
