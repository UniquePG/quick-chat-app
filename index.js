const { createClient } = require('redis');

const client = createClient({
    url: 'rediss://red-cth7mlpopnds73b0056g:XFmqReT2cRJqkKY6ihLkOF0Ve3jwwODd@oregon-redis.render.com:6379'
});

client.on('connect', () => {
    console.log('Connected to Redis!');
});

client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

async function testRedis() {
    await client.connect();
    const response = await client.ping();
    console.log('PING Response:', response); // Should print "PONG"
    await client.quit();
}

testRedis();
