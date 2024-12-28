const model = require('./model_tweets');
const express = require('express');
const bodyParser = require('body-parser');
const { printLog, printMsgLog, print} = require('./model_tweets');
const messages = require("./messages");
const logger = require('./logger');
const zmq = require('zeromq');

const REST_PORT = 8080;
const REST_HOST = "http://localhost";

const MSG_PORT = 9090;
const MSG_HOST = "tcp://127.0.0.1";

let app = express();
app.use(bodyParser.json());


// Comprueba que las funciones que requieren verificación las deje pasar.
app.use(function (req, res, next) {
  if ((req.path == '/twitter/sessions' && req.method == 'POST') ||
      (req.path == '/twitter/users' && req.method == 'POST')) {
      next();
  } else if (!req.query.token) {
      return next(new AppError('> Token not found', 401));
  } else {
      next();
  }
});


// definir rutas

/*======================================================*/
/*               ENDPOINT >> LISTTWEETS                 */
/*======================================================*/
app.get('/twitter/tweets', function (req, res) {
  const token = req.query.token; // Obtiene el token de la query
  // Verificar que el token esté presente
  if (!token) return res.status(401).send(print(messages.cmd.err.no_token, 401).message);
  let opts = {};
      if (req.query.opts) opts = JSON.parse(req.query.opts);
      model.listTweets(req.query.token, opts, (err, tweets) => {
        if (err) {
          res.status(400).send(err.message);
        } else {
          logger.info(printLog(`El usuario con ID <${req.query.token}> ha ejecutado el comando listTweets()`));
          res.send(tweets);
        }
      });
});


/*======================================================*/
/*                ENDPOINT >> ADDTWEET                  */
/*======================================================*/
app.post('/twitter/tweets', function (req, res) {
  const { token } = req.query; // Token recibido como parámetro
  const { content } = req.body; // Contenido del tweet en el cuerpo de la solicitud
  // Crear un nuevo tweet
  model.addTweet(token, content, (err, res) => {
    if (err) res.status(400).send(err.message);
    else {
      logger.info(printLog(messages.log.new_tweet.replace("%userID%", token).replace("%content%", content)));
      res.send({ success: true, id: res.id, owner: res.owner, content: res.content });
    }
  });
});

/*======================================================*/
/*               ENDPOINT >> ADDRETWEET                 */
/*======================================================*/
app.post('/twitter/tweets/:tweetID/retweets', function (req, res) {
  const token = req.query.token; // Obtener el token desde req.query
  const tweetID = req.params.tweetID; // Obtener tweetID desde los parámetros de la ruta

  // Crear un nuevo retweet
  model.addRetweet(token, tweetID, (err, tw) => {
    if (err) res.status(400).send(err.message);
    else {
      logger.info(printLog(messages.log.new_retweet.replace("%nick_retweet%",tw.user_retweet.nick).replace("%owner_nick%", tw.owner)
        .replace("%content%", tw.tweet.content).replace("%tweetID%",tw.tweet._id)));
      res.send({ success: true, user_retweet: tw.user_retweet, owner: tw.owner, tweet: tw.tweet });
    }
  });
});

/*======================================================*/
/*                  ENDPOINT >> LIKE                    */
/*======================================================*/
app.post('/twitter/tweets/:tweetID/likes', function (req, res) {
  const token = req.query.token; // Obtener el token desde req.query
  const tweetID = req.params.tweetID; // Obtener tweetID desde los parámetros de la ruta

  // Crear un nuevo retweet
  model.like(token, tweetID, (err, like) => {
    if (err) res.status(400).send(err.message);
    else {
      logger.info(printLog(messages.log.new_like.replace("%user_liked%",like.user.nick).replace("%owner_nick%",like.tweet.owner.nick)
        .replace("%content%",like.tweet.content).replace("%tweetID%",like.tweet._id)));
      res.send({ success: true, user: like.user, tweet: like.tweet });
    }
  });
});

/*======================================================*/
/*                 ENDPOINT >> DISLIKE                  */
/*======================================================*/
app.post('/twitter/tweets/:tweetID/dislikes', function (req, res) {
  const token = req.query.token; // Obtener el token desde req.query
  const tweetID = req.params.tweetID; // Obtener tweetID desde los parámetros de la ruta

  // Crear un nuevo retweet
  model.dislike(token, tweetID, (err, dislike) => {
    if (err) res.status(400).send(err.message);
    else {
      logger.info(printLog(messages.log.new_dislike.replace("%user_disliked%",dislike.user.nick).replace("%owner_nick%",dislike.tweet.owner.nick)
        .replace("%content%",dislike.tweet.content).replace("%tweetID%",dislike.tweet._id)));
      res.send({ success: true, user: dislike.user, tweet: dislike.tweet });
    }
  });
});



// Middleware manejo de errores.
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  res.status(statusCode).json(createErrorResponse(statusCode, message));
});

app.listen(REST_PORT);
logger.info("Servidor RESTful iniciado y escuchando en: "+REST_HOST+":"+REST_PORT);

async function startServer() {
  const sock = new zmq.Router();

  try {
    await sock.bind(`${MSG_HOST}:${MSG_PORT}`);
    logger.info(`Servidor de Mensajes Async iniciado y escuchando en: ${MSG_HOST}:${MSG_PORT}`);

    for await (const [address, msg] of sock) {
      logger.info(printMsgLog(msg.toString()));
      const parsedMsg = JSON.parse(msg.toString());

      switch (parsedMsg.type) {
        /*======================================================*/
        /*                MESSAGES >> ADDTWEET                  */
        /*======================================================*/
        case 'addTweet':
          model.addTweet(parsedMsg.token, parsedMsg.data, (err, res) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_tweet.replace("%userID%", parsedMsg.token).replace("%content%", parsedMsg.data)));
              response = { success: true, id: res.id, owner: res.owner, content: res.content };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
        /*======================================================*/
        /*               MESSAGES >> ADDRETWEET                 */
        /*======================================================*/
        case 'addRetweet':
          model.addRetweet(parsedMsg.token, parsedMsg.id, (err, res) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_retweet.replace("%nick_retweet%",res.user_retweet.nick).replace("%owner_nick%", res.owner)
                .replace("%content%", res.tweet.content).replace("%tweetID%",res.tweet._id)));
              response = { success: true, user_retweet: res.user_retweet, owner: res.owner, tweet: res.tweet };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
        /*======================================================*/
        /*                  MESSAGES >> LIKE                    */
        /*======================================================*/
        case 'like':
          model.like(parsedMsg.token, parsedMsg.id, (err, res) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_like.replace("%user_liked%",res.user.nick).replace("%owner_nick%",res.tweet.owner.nick)
                .replace("%content%",res.tweet.content).replace("%tweetID%",res.tweet._id)));
              response = { success: true, user: res.user, tweet: res.tweet };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
        /*======================================================*/
        /*                 MESSAGES >> DISLIKE                  */
        /*======================================================*/
        case 'dislike':
          model.dislike(parsedMsg.token, parsedMsg.id, (err, res) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_dislike.replace("%user_disliked%",res.user.nick).replace("%owner_nick%",res.tweet.owner.nick)
                .replace("%content%",res.tweet.content).replace("%tweetID%",res.tweet._id)));
              response = { success: true, user: res.user, tweet: res.tweet };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
        default:
          console.log('Tipo de mensaje desconocido: ' + parsedMsg.type);
          sock.send([address, JSON.stringify({ success: false, message: 'Tipo de mensaje desconocido.' })]);
          break;
      }
    }
  } catch (err) {
    console.error(err.stack);
  }
}

startServer();


function createErrorResponse(statusCode, message) { 
  return { status: 'error', statusCode: statusCode, message: message }; 
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}


