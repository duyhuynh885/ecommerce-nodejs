'use strict';

const { default: mongoose } = require('mongoose');
const os = require('os');
const process = require('process');
const _SECOND_LIMIT = 5000;

/**
 * Count connect
 * @returns numberConnection
 */
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections::: ${numConnection}`);
    return numConnection;
};

/**
 * check overload connect
 */
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;

        console.log(`Active connections: ${numConnection}`);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024}MB`);

        const maxConnections = numCores * 5;
        if (numConnection > maxConnections) {
            console.log(`Connection overload detected!`);
        }
    }, _SECOND_LIMIT); //Monitor every 5 seconds
};

module.exports = { countConnect };
