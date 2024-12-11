// consumidor 

const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Pull(); // Usamos el constructor `Pull` para crear el socket

  await sock.bind("tcp://127.0.0.1:3000"); // Usamos `bind` de manera asíncrona
  console.log("Listening on 3000");

  for await (const [msg] of sock) { // Escuchamos mensajes de forma asíncrona
    console.log("Received message:", msg.toString());
  }
}

run().catch((err) => console.error("Error:", err));