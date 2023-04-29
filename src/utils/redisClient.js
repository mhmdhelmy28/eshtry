const { createClient } = require('redis');
const logger = require('./logger');
const getClient = async() => {
    const client = createClient();

    client.on('error', err => logger.error('Redis Client Error', err));

    await client.connect();
    return client
}

module.exports = getClient