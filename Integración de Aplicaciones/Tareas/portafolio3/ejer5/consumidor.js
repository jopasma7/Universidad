var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, con) {
  if (err) {
    console.log(err.stack);
  } else {
    con.createChannel((err, channel) => {
      if (err) {
        console.log(err.stack);
      } else {
        var exchange = 'logs';

        // Eliminar el exchange si ya existe
        channel.deleteExchange(exchange, { ifUnused: false }, function (deleteErr) {
          if (deleteErr) {
            console.log('Error deleting exchange:', deleteErr);
          } else {
            console.log('Exchange deleted successfully (if it existed)');
          }

          // Ahora declarar el exchange con el tipo 'fanout'
          channel.assertExchange(exchange, 'fanout', { durable: false });

          // Crear una cola exclusiva que se eliminará automáticamente cuando se cierre la conexión
          channel.assertQueue('', { exclusive: true }, (err, q) => {
            if (err) {
              console.log(err.stack);
            } else {
              console.log('Waiting for messages');
              // Vincular la cola al exchange 'logs'
              channel.bindQueue(q.queue, exchange, '');

              // Consumir los mensajes de la cola
              channel.consume(q.queue, function (msg) {
                console.log('Received ' + msg.content.toString());
              }, { noAck: true });
            }
          });
        });
      }
    });
  }
});
