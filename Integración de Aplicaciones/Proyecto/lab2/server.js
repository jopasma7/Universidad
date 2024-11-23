const model = require('./model_mongo');
const express = require('express');
const bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.json());

// Comprueba que las funciones que requieren verificación las deje pasar.
app.use(function (req, res, next) {
    console.log('authorize ' + req.method + ' ' + req.originalUrl);
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
    console.log('add user  ' + JSON.stringify(req.body));
    model.addUser(req.body, (err, user) => {
      if (err) {
        console.log(err.stack);
        res.status(400).send(err);
      } else res.send(user);
    });
  });



//Login
app.post('/twitter/sessions', function (req, res) {
    console.log('login ' + JSON.stringify(req.body));
    if (!req.body.email || !req.body.password) 
      res.status(400).send('Parameters missing');
    else {
      model.login(req.body.email, req.body.password, (err, token, user) => {
        if (err) {
          console.log(err.stack);
          res.status(400).send(err);
        } else {
          res.send({ token: token, user: user });
        }
      });
    }
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

// listUsers
app.get('/twitter/users', function (req, res) {
    console.log('list users  ' + JSON.stringify(req.query));
    let opts = {};
    if (req.query.opts) opts = JSON.parse(req.query.opts);
    model.listUsers(req.query.token, opts, (err, users) => {
      if (err) {
        console.log(err.stack);
        res.status(400).send(err);
      } else {
        res.send(users);
      }
    });
});


app.listen(8080);