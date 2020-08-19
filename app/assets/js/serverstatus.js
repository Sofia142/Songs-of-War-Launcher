var net = require('net');
/**
 * Retrieves the status of a minecraft server.
 *
 * @param {string} address The server address.
 * @param {number} port Optional. The port of the server. Defaults to 25565.
 * @returns {Promise.<Object>} A promise which resolves to an object containing
 * status information.
 */
exports.getStatus = function (address, port) {
    if (port === void 0) { port = 25565; }
    if (port == null || port == '') {
        port = 25565;
    }
    if (typeof port === 'string') {
        port = parseInt(port);
    }
    return new Promise(function (resolve, reject) {
        var socket = net.connect(port, address, function () {
            var buff = Buffer.from([0xFE, 0x01]);
            socket.write(buff);
        });
        socket.setTimeout(10000, function () {
            socket.end();
            reject({
                code: 'ETIMEDOUT',
                errno: 'ETIMEDOUT',
                address: address,
                port: port
            });
        });
        socket.on('data', function (data) {
            if (data != null && data != '') {
                var server_info = data.toString().split('\x00\x00\x00');
                var NUM_FIELDS = 6;
                if (server_info != null && server_info.length >= NUM_FIELDS) {
                    resolve({
                        online: true,
                        version: server_info[2].replace(/\u0000/g, ''),
                        motd: server_info[3].replace(/\u0000/g, ''),
                        onlinePlayers: server_info[4].replace(/\u0000/g, ''),
                        maxPlayers: server_info[5].replace(/\u0000/g, '')
                    });
                }
                else {
                    resolve({
                        online: false
                    });
                }
            }
            socket.end();
        });
        socket.on('error', function (err) {
            socket.destroy();
            reject(err);
            // ENOTFOUND = Unable to resolve.
            // ECONNREFUSED = Unable to connect to port.
        });
    });
};
