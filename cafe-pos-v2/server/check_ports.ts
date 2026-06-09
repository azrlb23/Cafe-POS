import net from 'net';

function checkPort(host: string, port: number) {
  return new Promise((resolve) => {
    console.log(`Checking TCP connection to ${host}:${port}...`);
    const socket = new net.Socket();
    const timeout = 5000;

    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`[SUCCESS] Port ${port} is reachable.`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.log(`[TIMEOUT] Connection to port ${port} timed out after ${timeout}ms.`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err) => {
      console.log(`[ERROR] Connection to port ${port} failed: ${err.message}`);
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function run() {
  const host = 'aws-1-ap-southeast-1.pooler.supabase.com';
  await checkPort(host, 6543);
  await checkPort(host, 5432);
}

run();
