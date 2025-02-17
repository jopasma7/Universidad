const model = require('./model_mongo');
const express = require('express');
const bodyParser = require('body-parser');
const { printLog, print} = require('./model_mongo');
const messages = require("./messages");
const logger = require('./logger');

const PORT = 8080;
const HOST = "http://localhost";

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
    
    res.send(user); // Devuelve el usuario.

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
        res.send(updatedUser);

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
      res.status(400).send(err.message); // Error durante la eliminación
    } else {
      res.status(200).send(result);
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
      res.send(follow); // Devuelve el usuario.

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
      res.status(200).send(unfollow);
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
  model.addTweet(token, content, (err, tw) => {
    if (err) res.status(400).send(err.message);
    else {
      logger.info(printLog(messages.log.new_tweet.replace("%userID%", token).replace("%content%", content)));
      res.send(tw);
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
      res.send(tw);
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
      res.send(like);
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
      res.send(dislike);
    }
  });
});



// Middleware manejo de errores.
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  res.status(statusCode).json(createErrorResponse(statusCode, message));
});

app.listen(PORT);
logger.info("Servidor iniciado y escuchando en: "+HOST+":"+PORT);


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


