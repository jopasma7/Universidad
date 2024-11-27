const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Reply(); // Crear un socket de tipo 'rep'

  await sock.bind("tcp://127.0.0.1:3000"); // Escuchar en el puerto 3000
  console.log("Listening on port 3000");

  for await (const [msg] of sock) { // Manejar los mensajes recibidos de forma asíncrona
    console.log("Received message:", msg.toString());
    await sock.send(msg + " world!"); // Responder al mensaje
  }
}

run().catch((err) => console.error("Error:", err));
