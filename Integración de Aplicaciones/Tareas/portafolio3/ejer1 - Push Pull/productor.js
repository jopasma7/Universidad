// productor 

const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Push(); // Crear un socket de tipo 'push'

  sock.connect("tcp://127.0.0.1:3000"); // Conectar al servidor
  console.log("Connected to port 3000");

  await sock.send("Hello"); // Enviar un mensaje
  console.log("Message sent: Hello");

  sock.close(); // Cerrar el socket después de enviar el mensaje
}

run().catch((err) => console.error("Error:", err));
