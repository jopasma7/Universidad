var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, con) {
  if (err) console.error('Error al conectar con RabbitMQ:', err.stack);
  else {
    con.createChannel((err, channel) => {
      if (err) console.error('Error creating channel:', err.stack);
      else {
        var exchange = 'logs';
        var severity = process.argv.length > 2 ? process.argv[2] : 'info';

        channel.assertExchange(exchange, 'direct', { durable: false });
        channel.assertQueue('', { exclusive: true }, (err, q) => {
          if (err) console.error('Error con la Queue:', err.stack);
          else {
            console.log('Esperando los mensajes:');
            channel.bindQueue(q.queue, exchange, severity); // Usar la clave de enrutamiento

            channel.consume(q.queue, function (msg) {
              if (msg.content) {
                console.log('Recibido [Tipo: %s] Mensaje: %s', msg.fields.routingKey, msg.content.toString());
              }
            }, { noAck: true });
          }
        });
      }
    });
  }
});