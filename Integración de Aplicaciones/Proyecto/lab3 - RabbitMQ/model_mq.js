const amqp = require('amqplib');

const URL = 'amqp://localhost';
const EXCHANGE_NAME = 'twitterExchange';
/*======================================================*/
/*                 USUARIOS >> ADDUSER                  */
/*======================================================*/
/*  Esta función sirve para agregar nuevos usuarios a   */
/*          la base de datos de la aplicación           */
/*                  Requiere un <user>                  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*       Si logró o falló la creación del usuario       */

async function addUser(user, cb) {
    if (!user.name) cb(printErr(messages.cmd.addUser.no_name, 0));
    else if (!user.surname) cb(printErr(messages.cmd.addUser.no_surname, 0));
    else if (!user.email) cb(printErr(messages.cmd.addUser.no_email, 0));
    else if (!user.nick) cb(printErr(messages.cmd.addUser.no_nick, 0));
    else if (!user.password) cb(printErr(messages.cmd.addUser.no_password, 0));
    else {
        try {
            const connection = await amqp.connect(URL);
            const channel = await connection.createChannel();
            const queue = 'addUserQueue';
            const replyQueue = await channel.assertQueue('', { exclusive: true });
            const correlationId = generateUuid();
            const msg = { type: "addUser", data: user };

            await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
            await channel.bindQueue(queue, EXCHANGE_NAME, 'addUser');
            channel.publish(EXCHANGE_NAME, 'addUser', Buffer.from(JSON.stringify(msg)), {
                correlationId: correlationId,
                replyTo: replyQueue.queue
            });

            channel.consume(replyQueue.queue, (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    const response = JSON.parse(msg.content.toString());
                    cb(null, response);
                    channel.ack(msg);
                    setTimeout(() => {
                        channel.close();
                        connection.close();
                    }, 500);
                }
            }, { noAck: false });
        } catch (err) {
            cb(err);
        }
    }
}

function generateUuid() {
    return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

/*======================================================*/
/*               USUARIOS >> UPDATEUSER                 */
/*======================================================*/
/*   Esta función sirve para cambiar los datos de un    */
/*       un usuario. Almacenado en la Aplicación        */
/*                 Requiere un <token>                  */
/* Requiere especificar el usuario que queremos cambiar */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */
async function updateUser(token, newUserData, cb) {
    try {
        const connection = await amqp.connect(URL);
        const channel = await connection.createChannel();
        const queue = 'updateUserQueue';
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = generateUuid();
        const msg = { type: "updateUser", token: token, data: newUserData };

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
        await channel.bindQueue(queue, EXCHANGE_NAME, 'updateUser');
        await channel.publish(EXCHANGE_NAME, 'updateUser', Buffer.from(JSON.stringify(msg)), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        });

        channel.consume(replyQueue.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                cb(null, response);
                channel.ack(msg);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        }, { noAck: false });
    } catch (err) {
        cb(err);
    }
}

/*======================================================*/
/*               USUARIOS >> DELETEUSER                 */
/*======================================================*/
/*  Esta función sirve para eliminar los datos de un    */
/*       un usuario. Almacenado en la Aplicación        */
/*                 Requiere un <token>                  */
/*     Requiere especificar el usuario que queremos     */
/*    eliminar. Devuelve un <cb> con el resultado.      */

async function deleteUser(token, idUser, cb) {
    try {
        const connection = await amqp.connect(URL);
        const channel = await connection.createChannel();
        const queue = 'deleteUserQueue';
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = generateUuid();
        const msg = { type: "deleteUser", token: token, id: idUser };

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
        await channel.bindQueue(queue, EXCHANGE_NAME, 'deleteUser');
        channel.publish(EXCHANGE_NAME, 'deleteUser', Buffer.from(JSON.stringify(msg)), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        });

        channel.consume(replyQueue.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                cb(null, response);
                channel.ack(msg);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        }, { noAck: false });
    } catch (err) {
        cb(err);
    }
}

/*======================================================*/
/*                 USUARIOS >> FOLLOW                   */
/*======================================================*/
/*     Esta función sirve para seguir a otro usuario    */
/*                 Requiere un <token>                  */
/*      Necesita una ID del usuario para seguirle       */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de follow o no        */
async function follow(token, userId, cb) {
    try {
        const connection = await amqp.connect(URL);
        const channel = await connection.createChannel();
        const queue = 'followQueue';
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = generateUuid();
        const msg = { type: "follow", token: token, id: userId };

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
        await channel.bindQueue(queue, EXCHANGE_NAME, 'follow');
        channel.publish(EXCHANGE_NAME, 'follow', Buffer.from(JSON.stringify(msg)), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        });

        channel.consume(replyQueue.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                cb(null, response);
                channel.ack(msg);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        }, { noAck: false });
    } catch (err) {
        cb(err);
    }
}


/*======================================================*/
/*               USUARIOS >> UNFOLLOW                   */
/*======================================================*/
/* La función sirve para dejar de seguir a otro usuario */
/*                 Requiere un <token>                  */
/*  Necesita una ID del usuario para dejar de seguirle  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de unfollow o no      */
async function unfollow(token, userId, cb) {
    try {
        const connection = await amqp.connect(URL);
        const channel = await connection.createChannel();
        const queue = 'unfollowQueue';
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = generateUuid();
        const msg = { type: "unfollow", token: token, id: userId };

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
        await channel.bindQueue(queue, EXCHANGE_NAME, 'unfollow');
        channel.publish(EXCHANGE_NAME, 'unfollow', Buffer.from(JSON.stringify(msg)), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        });

        channel.consume(replyQueue.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                cb(null, response);
                channel.ack(msg);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        }, { noAck: false });
    } catch (err) {
        cb(err);
    }
}

/*======================================================*/
/*               MENSAJES >> ADDTWEET                   */
/*======================================================*/
/*          Agregar un nuevo Mensaje de Tweet           */
/*                Requiere un <token>                   */
/*    Contiene el contendo del mensaje en <content>     */
/*          Devuelve un <cb> con el resultado.          */

async function addTweet(token, content, cb) {
    try {
        const connection = await amqp.connect(URL);
        const channel = await connection.createChannel();
        const queue = 'addTweetQueue';
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = generateUuid();
        const msg = { type: "addTweet", token: token, data: content };

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
        await channel.bindQueue(queue, EXCHANGE_NAME, 'addTweet');
        channel.publish(EXCHANGE_NAME, 'addTweet', Buffer.from(JSON.stringify(msg)), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        });

        channel.consume(replyQueue.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                cb(null, response);
                channel.ack(msg);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        }, { noAck: false });
    } catch (err) {
        cb(err);
    }
}
/*======================================================*/
/*               MENSAJES >> ADDRETWEET                 */
/*======================================================*/
/*    Esta función sirve para dar retweet a un tweet    */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
async function addRetweet(token, tweetId, cb) {
    try {
        const connection = await amqp.connect(URL);
        const channel = await connection.createChannel();
        const queue = 'addRetweetQueue';
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = generateUuid();
        const msg = { type: "addRetweet", token: token, id: tweetId };

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
        await channel.bindQueue(queue, EXCHANGE_NAME, 'addRetweet');
        channel.publish(EXCHANGE_NAME, 'addRetweet', Buffer.from(JSON.stringify(msg)), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        });

        channel.consume(replyQueue.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                cb(null, response);
                channel.ack(msg);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        }, { noAck: false });
    } catch (err) {
        cb(err);
    }
}

/*======================================================*/
/*                  MENSAJES >> LIKE                    */
/*======================================================*/
/*   Esta función sirve para dar "Me gusta" a un tweet  */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
async function like(token, tweetId, cb) {
    try {
        const connection = await amqp.connect(URL);
        const channel = await connection.createChannel();
        const queue = 'likeQueue';
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = generateUuid();
        const msg = { type: "like", token: token, id: tweetId };

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
        await channel.bindQueue(queue, EXCHANGE_NAME, 'like');
        channel.publish(EXCHANGE_NAME, 'like', Buffer.from(JSON.stringify(msg)), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        });

        channel.consume(replyQueue.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                cb(null, response);
                channel.ack(msg);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        }, { noAck: false });
    } catch (err) {
        cb(err);
    }
}

/*======================================================*/
/*                 MENSAJES >> DISLIKE                  */
/*======================================================*/
/*    Función sirve para dar "No me gusta" a un tweet   */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
async function dislike(token, tweetId, cb) {
    try {
        const connection = await amqp.connect(URL);
        const channel = await connection.createChannel();
        const queue = 'dislikeQueue';
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = generateUuid();
        const msg = { type: "dislike", token: token, id: tweetId };

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
        await channel.bindQueue(queue, EXCHANGE_NAME, 'dislike');
        channel.publish(EXCHANGE_NAME, 'dislike', Buffer.from(JSON.stringify(msg)), {
            correlationId: correlationId,
            replyTo: replyQueue.queue
        });

        channel.consume(replyQueue.queue, (msg) => {
            if (msg.properties.correlationId === correlationId) {
                const response = JSON.parse(msg.content.toString());
                cb(null, response);
                channel.ack(msg);
                setTimeout(() => {
                    channel.close();
                    connection.close();
                }, 500);
            }
        }, { noAck: false });
    } catch (err) {
        cb(err);
    }
}

module.exports = {
    addUser, 
    updateUser,
    deleteUser,
    follow,
    unfollow,
    addTweet,
    addRetweet,
    like,
    dislike
       
}