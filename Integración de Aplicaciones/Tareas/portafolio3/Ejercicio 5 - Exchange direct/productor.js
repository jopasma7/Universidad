var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, con) {
  if (err) {
    console.error('Error a la hora de conectar con RabbitMQ:', err.stack);
  } else {
    con.createChannel(function (err, channel) {
      if (err) {
        console.error('Error al crear el canal:', err.stack);
      } else {
        var exchange = 'logs';
        var severity = process.argv.length > 3 ? process.argv[2] : 'info';
        var msg = process.argv.length > 2 ? process.argv.slice(3).join(' ') : 'Hello world!';
        channel.assertExchange(exchange, 'direct', { durable: false });

        channel.publish(exchange, severity, Buffer.from(msg));
        console.log(" [x] Se ha enviado '%s':'%s'", severity, msg);

        setTimeout(() => {
          con.close();
          process.exit(0);
        }, 500);
      }
    });
  }
});