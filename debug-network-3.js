const net = require('net');

const hosts = [
    { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543 }, // Testing US region
    { host: 'aws-0-sa-east-1.pooler.supabase.com', port: 6543 }, // Control (worked before)
];

console.log('--- Network Connectivity Test (Round 3) ---');

hosts.forEach(target => {
    console.log(`Testing connection to ${target.host}:${target.port}...`);
    const socket = new net.Socket();
    const start = Date.now();

    socket.setTimeout(5000);

    socket.on('connect', () => {
        console.log(`✅ SUCCESS: Connected to ${target.host}:${target.port} in ${Date.now() - start}ms`);
        socket.destroy();
    });

    socket.on('timeout', () => {
        console.log(`❌ TIMEOUT: Could not connect to ${target.host}:${target.port} (5s)`);
        socket.destroy();
    });

    socket.on('error', (err) => {
        console.log(`❌ ERROR: Failed to connect to ${target.host}:${target.port} - ${err.message}`);
    });

    socket.connect(target.port, target.host);
});
