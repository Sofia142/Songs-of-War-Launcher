var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var LoggerUtil = require('./loggerutil');
var logger = LoggerUtil('%c[AssetExec]', 'color: #003996; font-weight: bold');
var target = require('./assetguard')[process.argv[2]];
if (target == null) {
    process.send({ context: 'error', data: null, error: 'Invalid class name' });
    console.error('Invalid class name passed to argv[2], cannot continue.');
    process.exit(1);
}
var tracker = new (target.bind.apply(target, __spreadArrays([void 0], (process.argv.splice(3)))))();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
//const tracker = new AssetGuard(process.argv[2], process.argv[3])
logger.log('AssetExec Started');
// Temporary for debug purposes.
process.on('unhandledRejection', function (r) { return logger.log(r); });
var percent = 0;
function assignListeners() {
    tracker.on('validate', function (data) {
        process.send({ context: 'validate', data: data });
    });
    tracker.on('progress', function (data, acc, total) {
        var currPercent = parseInt((acc / total) * 100);
        if (currPercent !== percent) {
            percent = currPercent;
            process.send({ context: 'progress', data: data, value: acc, total: total, percent: percent });
        }
    });
    tracker.on('complete', function (data) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        process.send({ context: 'complete', data: data, args: args });
    });
    tracker.on('error', function (data, error) {
        process.send({ context: 'error', data: data, error: error });
    });
}
assignListeners();
process.on('message', function (msg) {
    if (msg.task === 'execute') {
        var func_1 = msg.function;
        var nS = tracker[func_1]; // Nonstatic context
        var iS = target[func_1]; // Static context
        if (typeof nS === 'function' || typeof iS === 'function') {
            var f = typeof nS === 'function' ? nS : iS;
            var res = f.apply(f === nS ? tracker : null, msg.argsArr);
            if (res instanceof Promise) {
                res.then(function (v) {
                    process.send({ result: v, context: func_1 });
                }).catch(function (err) {
                    process.send({ result: err.message || err, context: func_1 });
                });
            }
            else {
                process.send({ result: res, context: func_1 });
            }
        }
        else {
            process.send({ context: 'error', data: null, error: "Function " + func_1 + " not found on " + process.argv[2] });
        }
    }
    else if (msg.task === 'changeContext') {
        target = require('./assetguard')[msg.class];
        if (target == null) {
            process.send({ context: 'error', data: null, error: "Invalid class " + msg.class });
        }
        else {
            tracker = new (target.bind.apply(target, __spreadArrays([void 0], (msg.args))))();
            assignListeners();
        }
    }
});
process.on('disconnect', function () {
    logger.log('AssetExec Disconnected');
    process.exit(0);
});
