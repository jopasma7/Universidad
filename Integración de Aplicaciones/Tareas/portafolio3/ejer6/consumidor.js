var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, con) {
  if (err) console.log(err.stack);
  else {
    con.createChannel((err, channel) => {
      if (err) console.log(err.stack);
      else {
        var exchange = 'logs';

        // Eliminar el exchange anterior si existe
        channel.deleteExchange(exchange, { ifUnused: false }, function (deleteErr) {
          if (deleteErr) {
            console.log('Error deleting exchange:', deleteErr);
          } else {
            console.log('Exchange deleted successfully (if it existed)');
          }

          // Ahora declarar el exchange correctamente como 'direct' o 'topic'
          channel.assertExchange(exchange, 'direct', { durable: false });

          // Crear una cola exclusiva
          channel.assertQueue('', { exclusive: true }, (err, q) => {
            if (err) console.log(err.stack);
            else {
              // Vincular la cola al exchange 'logs' usando una clave de enrutamiento
              channel.bindQueue(q.queue, exchange, '');

              console.log('Waiting for messages');
              
              // Recibir mensajes
              channel.consume(q.queue, function (msg) {
                console.log('Received [' + msg.fields.routingKey + '] ' + msg.content.toString());
              }, { noAck: true });
            }
          });
        });
      }
    });
  }
});
