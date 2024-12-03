var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, con) {
  if (err) {
    console.error('Error al conectar con RabbitMQ:', err.stack);
    return;
  }

  con.createChannel((err, channel) => {
    if (err) {
      console.error('Error al crear el canal:', err.stack);
      return;
    }

    const exchange = 'hello-exchange';
    const queue = 'hello-queue';
    const routingKey = 'greetings';

    // Declarar el exchange
    channel.assertExchange(exchange, 'direct', { durable: false });

    // Declarar la cola
    channel.assertQueue(queue, { durable: false });

    // Enlazar la cola al exchange con la routing key
    channel.bindQueue(queue, exchange, routingKey);

    console.log('Esperando mensajes en la cola:', queue);

    // Consumir mensajes de la cola
    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          console.log('Mensaje recibido:', msg.content.toString());
        }
      },
      { noAck: true }
    );
  });
});
