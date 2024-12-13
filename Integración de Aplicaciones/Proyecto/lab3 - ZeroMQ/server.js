const model = require('./model_mongo');
const express = require('express');
const bodyParser = require('body-parser');
const { printLog, printMsgLog, print} = require('./model_mongo');
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
/*                ENDPOINT >> ADDUSER                   */
/*======================================================*/
app.post('/twitter/users', function (req, res, next) {
  model.addUser(req.body, (err, user) => {
    if (err) return next(new AppError(err.message, 400));
    
    res.send({ success: true, user: user }); // Devuelve el usuario.

    // Envía mensaje de LOG.
    logger.info(printLog(messages.log.new_user.replace("%name%", user.name).replace("%surname%", user.surname)
      .replace("%email%", user.email).replace("%nick%", user.nick)));
  });
});


/*======================================================*/
/*                  ENDPOINT >> LOGIN                   */
/*======================================================*/
app.post('/twitter/sessions', function (req, res) {
    if (!req.body.email || !req.body.password) 
      res.status(400).send(print("Falta el Email o Password", 400));
    else {
      model.login(req.body.email, req.body.password, (err, token, user) => {
        if (err) {
          res.status(400).send(err.message);
        } else {
          logger.info(printLog(messages.log.user_join.replace("%nick%", user.nick).replace("%email%", user.email)));
          res.send({ token: token, user: user });
        }
      });
    }
});

/*======================================================*/
/*               ENDPOINT >> UPDATEUSER                 */
/*======================================================*/
app.put('/twitter/users/:id', (req, res) => {
  const id = req.params.id; // Obtiene el token/id del parámetro de la ruta
  const newDataUser = req.body; // Obtiene los datos del usuario desde el cuerpo de la solicitud
  const token = req.query.token; // Obtiene el token de la query

  // Verificar que el token esté presente
  if (!token) return res.status(401).send(print(messages.cmd.err.no_token, 401).message);

  // Verificar que al menos un campo esté presente para actualizar
  if (!newDataUser || Object.keys(newDataUser).length === 0)
    return res.status(400).send(print(messages.cmd.updateUser.no_param, 400).message);
  

  // Llamada al model para actualizar el usuario
  model.updateUser(token, newDataUser, (err, updatedUser) => {
      if (err) return res.status(400).send(err.message); // Devuelve el error si ocurre algo 
      else{
        // Respuesta exitosa con el usuario actualizado
        res.send({success: true, user: updatedUser});

        logger.info(printLog(messages.log.new_update.replace("%name%",updatedUser.name).replace("%surname%",updatedUser.surname)
          .replace("%email%",updatedUser.email).replace("%nick%",updatedUser.nick).replace("%password%",updatedUser.password)));
      }    
  });
});

/*======================================================*/
/*              ENDPOINT >> DELETEUSER                  */
/*======================================================*/
app.delete('/twitter/users/:id', function (req, res) {
  const { token } = req.query; // Token recibido como parámetro
  const { id } = req.params;  // ID del usuario recibido en los parámetros de la ruta

  // Validaciones
  if (!token) return res.status(400).json({ error: 'Token es requerido' });
  if (!id) return res.status(400).json({ error: 'El ID del usuario es requerido' });
  // Llamar al método deleteUser para eliminar el usuario
  model.deleteUser(token, id, (err, result) => {
    if (err) {
      res.status(400).send({ error: err.message }); // Error al eliminar el usuario
    } else {
      res.status(200).send({ success: true, id: result.id, values: result }); // Usuario eliminado correctamente
    }
  });
});


/*======================================================*/
/*             ENDPOINT >> LISTFOLLOWING                */
/*======================================================*/
app.get('/twitter/users/:me/following', function (req, res) {
  const me  = req.params.me;  // usuario en los parámetros de la ruta
  const token = req.query.token; // Obtiene el token de la query
  // Verificar que el token esté presente
  if (!token) return res.status(401).send(print(messages.cmd.err.no_token, 401).message);
  // Verifica que el Token sea igual que la ID.
  if (token != me) return res.status(400).send(print(messages.err.invalid, 400).message);
  else {
    let opts = {};
    if (req.query.opts) opts = JSON.parse(req.query.opts);
    model.listFollowing(req.query.token, opts, (err, users) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        logger.info(printLog(`El usuario con ID <${req.query.token}> ha ejecutado el comando listFollowing()`));
        res.send(users);
      }
    });
  }

});

/*======================================================*/
/*             ENDPOINT >> LISTFOLLOWERS                */
/*======================================================*/
app.get('/twitter/users/:me/followers', function (req, res) {
  const me  = req.params.me;  // usuario en los parámetros de la ruta
  const token = req.query.token; // Obtiene el token de la query
  // Verificar que el token esté presente
  if (!token) return res.status(401).send(print(messages.cmd.err.no_token, 401).message);
  // Verifica que el Token sea igual que la ID.
  if (token != me) return res.status(400).send(print(messages.err.invalid, 400).message);
  else{
    let opts = {};
    if (req.query.opts) opts = JSON.parse(req.query.opts);
    model.listFollowers(req.query.token, opts, (err, users) => {
      if (err) {
        res.status(400).send(err.message);
      } else {
        logger.info(printLog(`El usuario con ID <${req.query.token}> ha ejecutado el comando listFollowers()`));
        res.send(users);
      }
    });
  }
});


/*======================================================*/
/*               ENDPOINT >> LISTUSERS                  */
/*======================================================*/
app.get('/twitter/users', function (req, res) {
  const token = req.query.token; // Obtiene el token de la query
  // Verificar que el token esté presente
  if (!token) return res.status(401).send(print(messages.cmd.err.no_token, 401).message);
  let opts = {};
      if (req.query.opts) opts = JSON.parse(req.query.opts);
      model.listUsers(req.query.token, opts, (err, users) => {
        if (err) {
          res.status(400).send(err.message);
        } else {
          logger.info(printLog(`El usuario con ID <${req.query.token}> ha ejecutado el comando listUsers()`));
          res.send(users);
        }
      });
});

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
/*                ENDPOINT >> FOLLOW                    */
/*======================================================*/
app.post('/twitter/users/:me/following', function (req, res) {
  const me  = req.params.me;  // usuario en los parámetros de la ruta
  const userId = req.body.userId;
  const token = req.query.token;

  // Verificar que el token esté presente
  if (!token) return res.status(401).send(print(messages.cmd.err.no_token, 401).message);
  if (token != me) return res.status(400).send(print(messages.err.invalid, 400).message);

  model.follow(me, userId, (err, follow) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      res.send({ success: true, user: follow.user, following : follow.following }); // Devuelve el usuario.

      // Envía mensaje de LOG.
      logger.info(printLog(messages.log.new_follow.replace("%user_nick%",follow.user.nick).replace("%target_nick%",follow.following.nick)));
    }
  }); 
});
/*======================================================*/
/*               ENDPOINT >> UNFOLLOW                   */
/*======================================================*/
app.delete('/twitter/users/:me/following/:userId', function (req, res) {
  const me  = req.params.me;  // usuario en los parámetros de la ruta
  const token = req.query.token;
  const userId  = req.params.userId;  // ID del usuario recibido en los parámetros de la ruta

  // Verificar que el token esté presente
  if (!token) return res.status(401).send(print(messages.cmd.err.no_token, 401).message);
  if (token != me) return res.status(400).send(print(messages.err.invalid, 400).message);

  model.unfollow(token, userId, (err, unfollow) => {
    if (err) res.status(400).send(err.message); // Error
    else {
      logger.info(printLog(messages.log.new_unfollow.replace("%user_nick%",unfollow.user.nick).replace("%target_nick%",unfollow.unfollowing.nick)));
      res.status(200).send({ success: true, user: unfollow.user, unfollowing : unfollow.unfollowing });
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

/*
async function startServer() {
    const sock = new zmq.Pull();

    try {
        await sock.bind(MSG_HOST+":"+MSG_PORT);
        logger.info("Servidor de Mensajes Async iniciado y escuchando en: "+MSG_HOST+":"+MSG_PORT);

        for await (const [msg] of sock) {
          logger.info(printMsgLog(msg.toString()));
          const parsedMsg = JSON.parse(msg.toString());

          switch (parsedMsg.type) {
              case 'addUser':
                  model.addUser(parsedMsg.data, (err, user) => {
                      if (err) console.log('add user ERROR: ' + err.stack);
                      else {
                        // Envía mensaje de LOG.
                        logger.info(printLog(messages.log.new_user.replace("%name%", user.name).replace("%surname%", user.surname)
                          .replace("%email%", user.email).replace("%nick%", user.nick)));
                      }
                  });
              break;

              case 'updateUser':
                  model.updateUser(parsedMsg.token, parsedMsg.data, (err, user) => {
                      if (err) console.log(err.message);
                      else {
                        logger.info(printLog(messages.log.new_update.replace("%name%",user.name).replace("%surname%",user.surname)
                          .replace("%email%",user.email).replace("%nick%",user.nick).replace("%password%",user.password)));
                      }
                  });
              break;

              case 'deleteUser':
                  model.deleteUser(parsedMsg.token, parsedMsg.id, (err) => {
                      if (err) console.log('delete user ERROR: ' + err.stack);
                      else console.log('delete user SUCCESS');
                  });
              break;

              case 'follow':
                  model.follow(parsedMsg.token, parsedMsg.id, (err) => {
                      if (err) console.log('follow ERROR: ' + err.stack);
                      else console.log('follow SUCCESS');
                  });
              break;

              case 'unfollow':
                  model.unfollow(parsedMsg.token, parsedMsg.id, (err) => {
                      if (err) console.log('unfollow ERROR: ' + err.stack);
                      else console.log('unfollow SUCCESS');
                  });
              break;

              case 'addTweet':
                  model.addTweet(parsedMsg.token, parsedMsg.data, (err) => {
                      if (err) console.log('addTweet ERROR: ' + err.stack);
                      else console.log('addTweet SUCCESS');
                  });
              break;

              case 'addRetweet':
                  model.addRetweet(parsedMsg.token, parsedMsg.id, (err) => {
                      if (err) console.log('addRetweet ERROR: ' + err.stack);
                      else console.log('addRetweet SUCCESS');
                  });
              break;

              case 'like':
                  model.like(parsedMsg.token, parsedMsg.id, (err) => {
                      if (err) console.log('like ERROR: ' + err.stack);
                      else console.log('like SUCCESS');
                  });
              break;

              case 'dislike':
                  model.dislike(parsedMsg.token, parsedMsg.id, (err) => {
                      if (err) console.log('dislike ERROR: ' + err.stack);
                      else console.log('dislike SUCCESS');
                  });
              break;
                

              default:
                  console.log('Unknown message type: ' + parsedMsg.type);
              break;
            }
        }
    } catch (err) {
        console.error(err.stack);
    }
}

startServer();*/

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
        /*                 MESSAGES >> ADDUSER                  */
        /*======================================================*/
        case 'addUser':
          model.addUser(parsedMsg.data, (err, user) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_user.replace("%name%", user.name).replace("%surname%", user.surname)
                .replace("%email%", user.email).replace("%nick%", user.nick)));
              response = { success: true, user: user };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
        /*======================================================*/
        /*               MESSAGES >> UPDATEUSER                 */
        /*======================================================*/
        case 'updateUser':
          model.updateUser(parsedMsg.token, parsedMsg.data, (err, user) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_update.replace("%name%", user.name)
                .replace("%surname%", user.surname)
                .replace("%email%", user.email)
                .replace("%nick%", user.nick)
                .replace("%password%", user.password)));
              response = { success: true, user: user };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
        /*======================================================*/
        /*               MESSAGES >> DELETEUSER                 */
        /*======================================================*/
        case 'deleteUser':
          model.deleteUser(parsedMsg.token, parsedMsg.id, (err, res) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_delete.replace("%nick%", res.nick)));
              response = { success: true, id: res.id, values: res };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
        /*======================================================*/
        /*                 MESSAGES >> FOLLOW                   */
        /*======================================================*/
        case 'follow':
          model.follow(parsedMsg.token, parsedMsg.id, (err, res) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_follow.replace("%user_nick%",res.user.nick).replace("%target_nick%",res.following.nick)));
              response = { success: true, user: res.user, following : res.following };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
        /*======================================================*/
        /*                MESSAGES >> UNFOLLOW                  */
        /*======================================================*/
        case 'unfollow':
          model.unfollow(parsedMsg.token, parsedMsg.id, (err, res) => {
            let response;
            if (err) response = { success: false, message: err.message };
            else {
              logger.info(printLog(messages.log.new_unfollow.replace("%user_nick%",res.user.nick).replace("%target_nick%",res.unfollowing.nick)));
              response = { success: true, user: res.user, unfollowing : res.unfollowing };
            }
            sock.send([address, JSON.stringify(response)]);
          });
        break;
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


