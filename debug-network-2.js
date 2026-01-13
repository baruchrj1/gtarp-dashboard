const net = require('net');

const hosts = [
    { host: 'db.ncilqgmdthlipqatjqon.supabase.co', port: 6543 }, // Testing pooler on main domain
    { host: 'db.ncilqgmdthlipqatjqon.supabase.co', port: 5432 }, // Control (failed before)
];

console.log('--- Network Connectivity Test (Round 2) ---');

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
