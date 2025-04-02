require('dotenv').config();
const localtunnel = require('localtunnel');

async function startTunnel() {
    const port = process.env.PORT || 3000;
    const subdomain = 'exp0s3d-agent';

    try {
        const tunnel = await localtunnel({
            port,
            subdomain
        });

        console.log('Tunnel URL:', tunnel.url);

        tunnel.on('error', err => {
            console.error('Tunnel error:', err);
            process.exit(1);
        });

        tunnel.on('close', () => {
            console.log('Tunnel closed');
            process.exit(0);
        });

        // Keep the process running
        process.on('SIGINT', () => {
            console.log('Closing tunnel...');
            tunnel.close();
        });
    } catch (err) {
        console.error('Failed to create tunnel:', err);
        process.exit(1);
    }
}

startTunnel(); 