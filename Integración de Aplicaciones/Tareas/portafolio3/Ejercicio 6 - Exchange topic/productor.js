var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, con) {
  if (err) console.error('Error al conectar con RabbitMQ:', err.stack);
  else {
    con.createChannel(function (err, channel) {
      if (err) console.error('Error creando el canal:', err.stack);
      else {
        var exchange = 'logs';
        var routingKey = process.argv.length > 2 ? process.argv[2] : 'info';
        var msg = process.argv.length > 3 ? process.argv.slice(3).join(' ') : 'Hello world!';

        channel.assertExchange(exchange, 'topic', { durable: false });
        channel.publish(exchange, routingKey, Buffer.from(msg));
        console.log(" [x] Mensaje enviado '%s':'%s'", routingKey, msg);

        setTimeout(() => {
          con.close();
          process.exit(0);
        }, 500);
      }
    });
  }
});