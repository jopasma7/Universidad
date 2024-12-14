const zmq = require("zeromq");

async function run() {
  const sock = new zmq.Publisher(); 

  await sock.bind("tcp://127.0.0.1:3000"); 
  console.log("El puerto del publicador es el 3000 para el ejemplo de Pub/Sub");

  setInterval(async () => {
    const message = ['Hora en Alcoy', 'Hora actual: ' + new Date().toLocaleString()];
    console.log("Enviando mensaje:", message);
    await sock.send(message); 
  }, 1000);
}

run().catch((err) => console.error("Error:", err));
