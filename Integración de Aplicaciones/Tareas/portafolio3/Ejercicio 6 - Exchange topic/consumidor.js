var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, con) {
  if (err) console.error('Error al conectar con RabbitMQ:', err.stack);
  else {
    con.createChannel(function (err, channel) {
      if (err) console.error('Error creando el canal:', err.stack);
      else {
        var exchange = 'logs';
        var key = process.argv.length > 2 ? process.argv[2] : '#'; 
        channel.assertExchange(exchange, 'topic', { durable: false });
        channel.assertQueue('', { exclusive: true }, function (err, q) {
          if (err) console.error('Error con la queue:', err.stack);
          else {
            console.log('Esperando los mensajes:');
            channel.bindQueue(q.queue, exchange, key);

            console.log(' [*] Esperando por los logs. Para salir pulsa CTRL+C');

            channel.consume(q.queue, function (msg) {
              if (msg.content) {
                console.log(' [x] Mensaje Recibido [%s]: %s', msg.fields.routingKey, msg.content.toString());
              }
            }, { noAck: true });
          }
        });
      }
    });
  }
});