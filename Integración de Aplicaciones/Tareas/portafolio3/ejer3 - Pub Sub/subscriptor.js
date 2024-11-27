const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Subscriber(); // Crear un socket de tipo 'sub'

  sock.connect("tcp://127.0.0.1:3000"); // Conectar al publicador
  console.log("Subscriber connected to port 3000");

  sock.subscribe("time"); // Suscribirse al tema 'time'
  console.log("Subscribed to topic 'time'");

  for await (const [topic, message] of sock) { // Escuchar mensajes de forma asíncrona
    console.log(`Received: ${message.toString()}`);
  }
}

run().catch((err) => console.error("Error:", err));
