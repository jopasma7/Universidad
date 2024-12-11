var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, con) {
  if (err) {
    console.log(err.stack);
  } else {
    con.createChannel(function (err, channel) {
      if (err) {
        console.log(err.stack);
      } else {
        var severity = process.argv.length > 3 ? process.argv[2] : 'info';
        var msg = process.argv.length > 2 ? process.argv.slice(2).join(' ') : 'Hello world!';
        var exchange = 'logs';
        var routingKey = process.argv.length > 3 ? process.argv[2] : 'unknown.info';

        // Eliminar el exchange si ya existe
        channel.deleteExchange(exchange, { ifUnused: false }, function (deleteErr) {
          if (deleteErr) {
            console.log('Error deleting exchange:', deleteErr);
          } else {
            console.log('Exchange deleted successfully (if it existed)');
          }

          // Declarar el exchange con tipo 'topic'
          channel.assertExchange(exchange, 'topic', { durable: false });

          // Publicar el mensaje en el exchange con la clave de enrutamiento
          channel.publish(exchange, routingKey, Buffer.from(msg));
          console.log(" [x] Sent '%s':'%s'", routingKey, msg);

          // Cerrar la conexión después de un breve retraso
          setTimeout(() => {
            con.close();
            process.exit(0);
          }, 500);
        });
      }
    });
  }
});
