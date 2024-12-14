const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Subscriber(); 

  sock.connect("tcp://127.0.0.1:3000"); 
  console.log("Subscriptor conectado al puerto 3000 para el ejemplo de Pub/Sub");

  sock.subscribe("Hora en Alcoy"); 
  console.log("Te has suscrito al tema: 'Hora en Alcoy'");

  for await (const [topic, message] of sock) { 
    console.log(`Mensaje: ${message.toString()}`);
  }
}

run().catch((err) => console.error("Error:", err));
