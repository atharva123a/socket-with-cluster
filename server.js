let express = require('express');
let cluster = require('cluster');
const sio = require('socket.io');
const farmhash = require('farmhash');
const net = require('net');
const sio_redis = require('socket.io-redis');
const Server = require("socket.io").Server;
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

let port = 3000;
let num_processes = require('os').cpus().length;

// this is like a hashmap that will map the source IP addresses to our workers:
let workers = []

// this is used to spawn/restart worker:
let spawn = (i) => {
    workers[i] = cluster.fork();
    workers[i].on('exit', (code, signal) => {
        console.log('restaring worker', i + 1);
        spawn(i);
    })
}
if (cluster.isMaster) {
    for (let i = 0; i < num_processes; i++) {
        // console.log('creating fork num:', (i + 1));
        // cluster.fork();
        console.log('spawning, ' + (i + 1))
        spawn(i);
    }

    let worker_index = (ip, len) => {
        return farmhash.fingerprint32(ip) % len;
    }

    const server = net.createServer({ pauseOnConnect: true }, (connection) => {
        let worker = workers[worker_index(connection.remoteAddress, num_processes)];
        worker.send('sticky-session:connection', connection);
    }).listen(port);

} else {
    let app = new express();

    let server = app.listen(0, 'localhost');
    let io = sio(server);

    // this code was how we used to do it previously
    /*
    // Tell Socket.IO to use the redis adapter. By default, the redis
    // server is assumed to be on localhost:6379. You don't have to
    // specify them explicitly unless you want to change them.
    io.adapter(sio_redis({ host: 'localhost', port: 6379 }));

    */
    // new approach:
    const pubClient = createClient({ url: "redis://localhost:6379" });
    const subClient = pubClient.duplicate();

    io.adapter(createAdapter(pubClient, subClient));

    // Here you might use Socket.IO middleware for authorization etc.

    // Listen to messages sent from the master. Ignore everything else.
    process.on('message', function (message, connection) {
        if (message !== 'sticky-session:connection') {
            return;
        }

        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        server.emit('connection', connection);

        connection.resume();
    });

}