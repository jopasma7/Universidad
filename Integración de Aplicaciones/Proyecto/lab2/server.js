const model = require('./model_mongo');
const express = require('express');
const bodyParser = require('body-parser');
const { printErr, logger } = require('./model_mongo');
const messages = require("./messages");

let app = express();
app.use(bodyParser.json());

// Comprueba que las funciones que requieren verificación las deje pasar.
app.use(function (req, res, next) {
    //console.log('authorize ' + req.method + ' ' + req.originalUrl);
    /* Authorization */
    if ((req.path == '/twitter/sessions' && req.method == 'POST') ||
        (req.path == '/twitter/users' && req.method == 'POST')) {
        next();
    } else if (!req.query.token) res.status(401).send('Token not found');
    else next();
});

// definir rutas

/*======================================================*/
/*                ENDPOINT >> ADDUSER                   */
/*======================================================*/
app.post('/twitter/users', function (req, res) {
    //console.log('add user  ' + JSON.stringify(req.body));
    model.addUser(req.body, (err, user) => {
      if (err) {
        //console.log(err.message);
        res.status(400).send(err.message);
      } else {
        res.send(user); // Devuelve el usuario.

        // Envía mensaje de LOG.
        logger(messages.log.new_user.replace("%name%",user.name).replace("%surname%",user.surname)
        .replace("%email%",user.email).replace("%password%",user.password).replace("%nick%",user.nick));
      }
    });
  });

/*======================================================*/
/*                  ENDPOINT >> LOGIN                   */
/*======================================================*/
app.post('/twitter/sessions', function (req, res) {
    //console.log('login ' + JSON.stringify(req.body));
    if (!req.body.email || !req.body.password) 
      res.status(400).send(printErr("Falta el Email o Password",0));
    else {
      model.login(req.body.email, req.body.password, (err, token, user) => {
        if (err) {
          res.status(400).send(err.message);
        } else {
          logger(messages.log.user_join.replace("%nick%", user.nick).replace("%email%", user.email));
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
  if (!token) return res.status(401).send(printErr(messages.cmd.err.no_token, 0).message);

  // Verificar que al menos un campo esté presente para actualizar
  if (!newDataUser || Object.keys(newDataUser).length === 0)
    return res.status(400).send(printErr(messages.cmd.updateUser.no_param, 0).message);
  

  // Llamada al model para actualizar el usuario
  model.updateUser(token, newDataUser, (err, updatedUser) => {
      if (err) return res.status(400).send(err.message); // Devuelve el error si ocurre algo 
      else{
        // Respuesta exitosa con el usuario actualizado
        res.send(updatedUser);

        logger(messages.log.new_update.replace("%name%",updatedUser.name).replace("%surname%",updatedUser.surname)
          .replace("%email%",updatedUser.email).replace("%nick%",updatedUser.nick).replace("%password%",updatedUser.password));
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
  model.deleteUser(id, (err, result) => {
    if (err) {
      res.status(400).send(err.message); // Error durante la eliminación
    } else {
      logger(messages.log.new_delete.replace('%userID%', id)); // Log de eliminación exitosa
      res.status(200).send(result);
    }
  });
});





/*======================================================*/
/*             ENDPOINT >> LISTFOLLOWING                */
/*======================================================*/
app.get('/twitter/users/:me/following', function (req, res) {
    //console.log('list following  ' + JSON.stringify(req.query));
    if (req.query.token != req.params.me) 
      res.status(400).send('Forbidden operation');
    else {
      let opts = {};
      if (req.query.opts) opts = JSON.parse(req.query.opts);
      model.listFollowing(req.query.token, opts, (err, users) => {
        if (err) {
          //console.log(err.message);
          logger(`El usuario con ID <${req.query.token}> ha ejecutado el comando listFollowing()`);
          res.status(400).send(err.message);
        } else {
          res.send(users);
        }
      });
    }
});

/*======================================================*/
/*               ENDPOINT >> LISTTWEETS                 */
/*======================================================*/
app.get('/twitter/tweets', function (req, res) {
    console.log('list tweets  ' + JSON.stringify(req.query));
    let opts = {};
    if (req.query.opts) opts = JSON.parse(req.query.opts);
    model.listTweets(req.query.token, opts, (err, tweets) => {
      if (err) {
        console.log(err.stack);
        res.status(400).send(err);
      } else {
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
  // Validaciones
  if (!token) return res.status(400).json({ error: 'Token es requerido' });
  if (!content) return res.status(400).json({ error: 'El contenido del tweet es requerido' });

  // Crear un nuevo tweet
  model.addTweet(token, content, (err, tw) => {
    if (err) {
      console.log(err.message);
      res.status(400).send(err.message);
    }
    else {
      logger(messages.log.new_tweet.replace("%userID%", token).replace("%content%", content));
      res.send(tw);
    }
  });
});

app.listen(8080);