
const zmq = require("zeromq");
async function run() {
  const sock = new zmq.Push(); // Crear un socket de tipo 'push'

  sock.connect("tcp://127.0.0.1:3000"); // Conectar al servidor
  console.log("Conectado al puerto 3000");

  let mensaje = "Hola, ¿Hay alguien?";
  await sock.send(mensaje); 
  console.log("Mensaje enviado:", mensaje);

  sock.close(); 
}

run().catch((err) => console.error("Error:", err));
