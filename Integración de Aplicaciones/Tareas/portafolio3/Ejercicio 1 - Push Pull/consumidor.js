// consumidor 
const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Pull(); 

  await sock.bind("tcp://127.0.0.1:3000"); 
  console.log("Escuchando en el puerto 3000");

  for await (const [msg] of sock) {
    console.log("Mensaje Recibido:", msg.toString());
  }
}

run().catch((err) => console.error("Error:", err));