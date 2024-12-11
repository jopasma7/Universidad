const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Request(); // Crear un socket de tipo 'req'

  sock.connect("tcp://127.0.0.1:3000"); // Conectar al servidor
  console.log("Connected to port 3000");

  await sock.send("Hello"); // Enviar el mensaje
  console.log("Message sent: Hello");

  const [reply] = await sock.receive(); // Esperar y recibir la respuesta
  console.log("Received reply:", reply.toString());

  sock.close(); // Cerrar el socket
  process.exit(0); // Finalizar el proceso
}

run().catch((err) => console.error("Error:", err));
