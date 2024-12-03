var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function (err, con) {
  if (err) console.log(err.stack);
  else {
    con.createChannel((err, channel) => {
      if (err) console.log(err.stack);
      else {
        channel.assertExchange('logs', 'direct', { durable: false });
        channel.assertQueue('', { exclusive: true }, (err, q) => {
          if (err) console.log(err.stack);
          else {
            console.log('Waiting for messages');
            var severities = process.argv.length > 2? 
                            process.argv.slice(2): ['info'];
            severities.forEach((severity) => {
              channel.bindQueue(q.queue, 'logs', severity);
            }); 
            channel.consume(q.queue, function (msg) {
              console.log('Received [' + msg.fields.routingKey + '] ' +
                          msg.content.toString());
            }, { noAck: true });
          }
        });
    }});
}});
