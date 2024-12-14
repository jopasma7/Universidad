const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Reply(); // Crear un socket de tipo 'rep'

  await sock.bind("tcp://127.0.0.1:3000"); // Escuchar en el puerto 3000
  console.log("Escuchando en el puerto 3000 ejemplo Request / Reply");

  for await (const [msg] of sock) { // Manejar los mensajes recibidos de forma asíncrona
    console.log("Mensaje Recibido:", msg.toString());
    await sock.send(msg + " world!"); // Responder al mensaje
  }
}

run().catch((err) => console.error("Error:", err));
