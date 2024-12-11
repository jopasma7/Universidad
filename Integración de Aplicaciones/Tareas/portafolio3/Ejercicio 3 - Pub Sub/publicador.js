const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Publisher(); // Crear un socket de tipo 'pub'

  await sock.bind("tcp://127.0.0.1:3000"); // Escuchar en el puerto 3000
  console.log("Publisher bound to port 3000");

  setInterval(async () => {
    const message = ['time', 'Current time is: ' + new Date().toLocaleString()];
    console.log("Sending message:", message);
    await sock.send(message); // Enviar el mensaje
  }, 1000);
}

run().catch((err) => console.error("Error:", err));
