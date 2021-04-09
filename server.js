const { Server } = require('net');

const host = '0.0.0.0';
const END = 'END';

const connections = new Map();

const error = (message) => {
  console.error(message);
  process.exit(1);
};

const sendMessage = (message, origin) => {
  //Mandar a todos menos a origin el message
  for (const socket of connections.keys()) {
    if (socket !== origin) {
      socket.write(message);
    }
  }
};
const listen = (port) => {
  const server = new Server();

  server.on('connection', (socket) => {
    const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;
    // connections.set(socket, 'Test');
    console.log(`Nueva conexion de: ${remoteSocket} `);
    socket.setEncoding('utf-8');

    socket.on('data', (message) => {
      if (!connections.has(socket)) {
        console.log(`USERNAME ${message} enviar para conexion ${remoteSocket}`);
        connections.set(socket, message);
      } else if (message === END) {
        connections.delete(socket);
        socket.end();
      } else {
        const fullMessage = `[${connections.get(socket)}] : ${message}`;
        //Enviar el mensaje al resto de clientes
        console.log(`${remoteSocket} -> ${fullMessage} `);
        sendMessage(fullMessage, socket);
      }
    });
    socket.on('error', (err) => error(err.message));
    socket.on('close', () => {
      console.log(`Conexion con ${remoteSocket} cerrada`);
    });
  });
  server.listen({ port, host }, () => {
    console.log(`Escuchando en puerto: ${port}`);
  });

  server.on('error', (err) => error(err.message));
};

const main = () => {
  if (process.argv.length !== 3) {
    error(`Usage: node ${__filename} port`);
  }
  let port = process.argv[2];
  if (isNaN(port)) {
    error(`El puerto es invalido: ${port}`);
  }
  port = Number(port);
  listen(port);
};

if (require.main === module) {
  main();
}
