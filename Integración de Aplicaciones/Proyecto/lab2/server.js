const model = require('./model_mongo');
const express = require('express');
const bodyParser = require('body-parser');
const { printErr, ErrWithLog, sendLog } = require('./model_mongo');
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

// Crear usuarios
app.post('/twitter/users', function (req, res) {
    //console.log('add user  ' + JSON.stringify(req.body));
    model.addUser(req.body, (err, user) => {
      if (err) {
        //console.log(err.message);
        res.status(400).send(err.message);
      } else {
        res.send(user); // Devuelve el usuario.

        // Envía mensaje de LOG.
        sendLog(messages.log.new_user.replace("%name%",user.name).replace("%surname%",user.surname)
        .replace("%email%",user.email).replace("%password%",user.password).replace("%nick%",user.nick));
      }
    });
  });



//Login
app.post('/twitter/sessions', function (req, res) {
    //console.log('login ' + JSON.stringify(req.body));
    if (!req.body.email || !req.body.password) 
      res.status(400).send(printErr("Falta el Email o Password",0));
    else {
      model.login(req.body.email, req.body.password, (err, token, user) => {
        if (err) {
          res.status(400).send(err.message);
        } else {
          sendLog(messages.log.user_join.replace("%nick%", user.nick).replace("%email%", user.email));
          res.send({ token: token, user: user });
        }
      });
    }
  });

  // Endpoint para actualizar un usuario
app.put('/twitter/users/:id', (req, res) => {
  const id = req.params.id; // Obtiene el username del parámetro de la ruta
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

        sendLog(messages.log.new_update.replace("%name%",updatedUser.name).replace("%surname%",updatedUser.surname)
          .replace("%email%",updatedUser.email).replace("%nick%",updatedUser.nick).replace("%password%",updatedUser.password));
      }    
  });
});

// listUsers
app.get('/twitter/users', function (req, res) {
    //console.log('list users  ' + JSON.stringify(req.query));
    let opts = {};
    if (req.query.opts) opts = JSON.parse(req.query.opts);
    model.listUsers(req.query.token, opts, (err, users) => {
      if (err) {
        //console.log(err.message);
        res.status(400).send(err.message);
      } else {
        res.send(users);
      }
    });
});





// listFollowing
app.get('/twitter/users/:me/following', function (req, res) {
    console.log('list following  ' + JSON.stringify(req.query));
    if (req.query.token != req.params.me) 
      res.status(400).send('Forbidden operation');
    else {
      let opts = {};
      if (req.query.opts) opts = JSON.parse(req.query.opts);
      model.listFollowing(req.query.token, opts, (err, users) => {
        if (err) {
          console.log(err.stack);
          res.status(400).send(err);
        } else {
          res.send(users);
        }
      });
    }
});

// ListTweets
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


app.listen(8080);