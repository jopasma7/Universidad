const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Request(); // Crear un socket de tipo 'req'

  sock.connect("tcp://127.0.0.1:3000"); // Conectar al servidor
  console.log("Conectado al puerto 3000 para el ejemplo de Request / Reply");

  await sock.send("Hello"); // Enviar el mensaje
  console.log("Mensaje enviado: Hello");

  const [reply] = await sock.receive(); // Esperar y recibir la respuesta
  console.log("Respuesta recibida:", reply.toString());

  sock.close(); // Cerrar el socket
  process.exit(0); // Finalizar el proceso
}

run().catch((err) => console.error("Error:", err));
