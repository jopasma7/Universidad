var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function (err, con) {
  if (err) console.log(err.stack);
  else {
    con.createChannel(function (err, channel) {
      if (err) console.log(err.stack);
      else {
        var msg = 'Hello world';
        channel.assertExchange('hello-exchange', 'direct',
                               {durable: false});
        channel.publish('hello-exchange', 'greetings',
                         Buffer.from(msg));
        setTimeout( () => {
          con.close();process.exit(0);}, 500);
      }});
}});
