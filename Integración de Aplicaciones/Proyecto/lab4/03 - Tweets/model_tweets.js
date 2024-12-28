const mongodb = require('mongodb'); 
const axios = require('axios');
const MongoClient = mongodb.MongoClient; 
const url = 'mongodb://localhost:27017';
const database = 'twitter_lite';
const messages= require("./messages"); 
const logger = require('./client/logger');

var colecciones = {
    tweets : "tweets"
}

// Función auxiliar para obtener la sesión de un usuario
function getSession(token, cb) {
  axios.get(urlUsers + '/sessions',{ params: { token: token } }).then(res => {
          cb(null, res.data)
      }).catch(err => {
          cb(err);
      });
}

// Función auxiliar para listar usuarios
function listUsers(token, opts, cb) {
    axios.get(urlUsers + '/users', { params: { token: token, opts: JSON.stringify(opts) }}).then(res => {
            cb(null, res.data)
        }).catch(err => {
            cb(err);
        });
  }

/*======================================================*/
/*               MENSAJES >> ADDTWEET                   */
/*======================================================*/
/*          Agregar un nuevo Mensaje de Tweet           */
/*                Requiere un <token>                   */
/*    Contiene el contendo del mensaje en <content>     */
/*          Devuelve un <cb> con el resultado.          */

function addTweet(token, content, cb){
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        const _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let tweets = db.collection(colecciones.tweets);    

        /* Verificar que el token del usuario esté presente */
        getSession(token, (err, user) => {
            if (err) return _cb(print(messages.cmd.err.no_token, 400));
            /* Creación de Tweet : Estructura */
            let contentMsg = content.replace(/'/g, '');
            let tweet = {
                owner : {
                    id : user._id,
                    name : user.name + " " + user.surname,
                    nick : user.nick
                },
                content : contentMsg,
                retweets : [],
                like : [],
                dislike : []
            }
            /* Ejecuta insertOne para crear e insertar el tweet en la base de datos */        
            tweets.insertOne(tweet).then(result => {              
                _cb(null, { id: result.insertedId.toHexString(), owner: _user._id, content: contentMsg });          
            }).catch(err => {              
                _cb(err)            
            });
        }); 
    }).catch(err => {    
        cb(err);  
    });
}

/*======================================================*/
/*               MENSAJES >> ADDRETWEET                 */
/*======================================================*/
/*    Esta función sirve para dar retweet a un tweet    */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
function addRetweet(token, tweetId, cb){
    MongoClient.connect(url).then(client => {  

        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let tweets = db.collection(colecciones.tweets);     

        /* Verificar que el token del usuario esté presente */
        getSession(token, (err, _user) => {
            if (!_user) return _cb(print(messages.cmd.err.no_token, 400)); 
            /* Revisaremos si el Tweet al que queremos dar Retweet existe en la base de datos */            
            tweets.findOne({ _id: new mongodb.ObjectId(tweetId) }).then(tw => {
                /* Si no existe el TweetID envía un mensaje de error y devuelve el cb */
                if (!tw) return _cb(print((messages.cmd.addRetweet.no_exists.replace("%tweetID%",tweetId)), 404));
                    
                /* Tenemos que revisar que no se pueda dar retweet la misma persona a su propio tweet */
                if(tw.owner.id.toString() === _user._id.toHexString()) return _cb(print(messages.cmd.addRetweet.your_tweet, 403));
                
                /* Como si que está en la base de datos, procederemos a hacer el retweet */
                /* Pero antes tenemos que revisar si el usuario ya ha dado retweet previamente a ese mensaje */
                if(tw.retweets.map(id => id.id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                    /* Error : Ya hiciste retweet de ese mensaje */
                    return _cb(print(messages.cmd.addRetweet.already_retweet, 403));  
                }

                let r = { id : _user._id, nick : _user.nick }
                 /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                tweets.updateOne({ _id: new mongodb.ObjectId(tweetId) }, 
                    {
                        $push: { retweets: r }
                    }
                    ).then(result => {  /* Agrega el nuevo usuario al array de retweets*/
                    
                        if(result){                                    
                            /* Ya tenemos nuestro nombre agregado en la lista retweets del Tweet. */
                            _cb(null, {tweet : tw, owner : tw.owner.nick, user_retweet: _user});
                        }else _cb(err);
                }).catch(err => {              
                    _cb(err)            
                });
            }).catch(err => {      
                _cb(err)    
            });    
        }); 
    }).catch(err => {    
        cb(err);  
    }); 
}

/*======================================================*/
/*                MENSAJES >> LISTTWEETS                */
/*======================================================*/
/*         Esta función sirve para listar todos         */
/*        los tweets que hay en la base de datos        */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listTweets(token, opts, cb) {  
    MongoClient.connect(url).then(client => {  

        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */  
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let tweets = db.collection(colecciones.tweets);   

        /* Verificar que el token del usuario esté presente */
        getSession(token, (err, _user) => {    
            if (err) return _cb(print(messages.cmd.err.no_token, 400)); 

            let jsonQuery = {};
            if(opts.q && typeof opts.q === 'string' && opts.q.trim() !== ''){
                const qu = opts.q.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a la clave.
                    .replace(/^'+|'+$/g, '') // Quita las comillas de fuera.
                    .replace(/'/g, '"');// Cambiar comillas simples por comillas dobles.
                        
                try { jsonQuery = JSON.parse(qu); } // Parseamos para convertirlo en un JSON.
                catch(err){ return _cb(print(messages.cmd.listTweets.invalid_format, 400)); } // Mensaje de inválid format JSON.        
            }  

            let _query = jsonQuery; let _opts = {};
            if (opts.i) _opts.skip = opts.i;
            if (opts.c) _opts.limit = opts.c;
            if (opts.s && typeof opts.s === 'string' && opts.s.trim() !== '') _opts.s = [[opts.s.slice(1),(opts.s.charAt(0) == '+' ? 1 : -1)]];
            tweets.find(_query, _opts).toArray().then(tweet => { 
                if(tweet.length == 0) return _cb(print(messages.cmd.listTweets.no_results, 100));
                let results = tweet.map((a) => { // Mapeamos el vector para mostrar únicamente los valores que queremos.        
                    return {              
                        id: a._id.toHexString(), owner: a.owner.nick, content: a.content, retweets: a.retweets.length, like: a.like.length, dislike: a.dislike.length         
                    };          
                });
                _cb(null, results);
            }).catch(err => {          
                _cb(err)        
            });
        });
    }).catch(err => {    
        cb(err);  
    }); 
}

/*======================================================*/
/*                  MENSAJES >> LIKE                    */
/*======================================================*/
/*   Esta función sirve para dar "Me gusta" a un tweet  */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
function like(token, tweetId, cb){
    MongoClient.connect(url).then(client => {  

        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);     
        let tweets = db.collection(colecciones.tweets);     

        /* Verificar que el token del usuario esté presente */
        getSession(token, (err, _user) => { 
            if (err) return _cb(print(messages.cmd.err.no_token, 400));
            /* Revisaremos si el Tweet al que queremos dar like existe en la base de datos */            
            tweets.findOne({ _id: new mongodb.ObjectId(tweetId) }).then(tw => {
                if (!tw) return _cb(print((messages.cmd.like.no_exists.replace("%tweetID%",tweetId)), 404));
                /* Tenemos que revisar que no se pueda dar like la misma persona a su propio tweet */
                if(tw.owner.id.toString() === _user._id.toHexString()) return _cb(print(messages.cmd.like.your_tweet, 403));
                /* Como si que está en la base de datos, procederemos a hacer el like */
                /* Pero antes tenemos que revisar si el usuario ya ha dado like previamente a ese mensaje */
                if(tw.like.map(id => id.id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                    /* Error : Ya tienes like a ese mensaje */
                    return _cb(print(messages.cmd.like.already_like, 403));
                }
                let lk = { id : _user._id, nick : _user.nick }

                 /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                tweets.updateOne({ _id: new mongodb.ObjectId(tweetId) }, 
                    {
                        $push: { like: lk },
                        $pull: { dislike: { id: { $in: [_user._id] } }  }
                    }
                    ).then(result => {  /* Agrega el nuevo usuario al array de likes*/            
                        if(result) _cb(null, {tweet : tw, user : _user });
                        else _cb(err);
                }).catch(err => {              
                    _cb(err)            
                });
            }).catch(err => {      
                _cb(err)    
            });    
        }).catch(err => {      
            _cb(err)    
        });  
    }).catch(err => {    
        cb(err);  
    }); 
}

/*======================================================*/
/*                 MENSAJES >> DISLIKE                  */
/*======================================================*/
/*    Función sirve para dar "No me gusta" a un tweet   */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
function dislike(token, tweetId, cb){
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }   
        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users); 
        let tweets = db.collection(colecciones.tweets);     

        /* Verificar que el token del usuario esté presente */
        getSession(token, (err, _user) => {
            if (err) return _cb(print(messages.cmd.err.no_token, 400));
            /* Revisaremos si el Tweet al que queremos dar dislike existe en la base de datos */            
            tweets.findOne({ _id: new mongodb.ObjectId(tweetId) }).then(tw => {
                if (!tw) {
                    /* Si no existe el TweetID envía un mensaje de error y devuelve el cb */
                    return _cb(print((messages.cmd.dislike.no_exists.replace("%tweetID%",tweetId)), 404));  
                }
                /* Tenemos que revisar que no se pueda dar dislike la misma persona a su propio tweet */
                if(tw.owner.id.toString() === _user._id.toHexString())return _cb(print(messages.cmd.dislike.your_tweet, 403));

                /* Como si que está en la base de datos, procederemos a hacer el dislike */
                /* Pero antes tenemos que revisar si el usuario ya ha dado dislike previamente a ese mensaje */
                if(tw.dislike.map(id => id.id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                    /* Error : Ya tienes dislike a ese mensaje */
                    return _cb(print(messages.cmd.dislike.already_dislike, 403));
                }

                let lk = {  id : _user._id,  nick : _user.nick }

                 /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                tweets.updateOne({ _id: new mongodb.ObjectId(tweetId) }, 
                    {
                        $push: { dislike: lk },
                        $pull: { like: { id: { $in: [_user._id] } }  }
                    }
                    ).then(result => {  /* Agrega el nuevo usuario al array de dislikes*/
                    
                        if(result) cb(null, {tweet : tw, user : _user });
                        else _cb(err);
                }).catch(err => {              
                    _cb(err)            
                });
            }).catch(err => {      
                _cb(err)    
            });    
        }).catch(err => {      
            _cb(err)    
        });  
    }).catch(err => {    
        cb(err);  
    }); 
}

function printLog(message) {
    return '\x1b[90m[Server] \x1b[3m'+message+'\x1b[0m';
}

function printMsgLog(message) {
    return '\x1b[90m[Mensaje] \x1b[3m'+message+'\x1b[0m';
}

function print(message, code = 0) {
    const statusCodes = {
      100: '[100 Info]',
      200: '[200 Éxito]',
      201: '[201 Created]',
      400: '[400 Bad Request]',
      401: '[401 Unauthorized]',
      403: '[403 Forbidden]',
      404: '[404 Not Found]',
      405: '[404 Not Allowed]',
      409: '[409 Conflict]',
      422: '[422 Unprocessable Entity]',
      500: '[500 Internal Server Error]',
      501: '[501 Not Implemented]',
    };
  
    const colors = {
      info: '\x1b[34m', // Azul
      success: '\x1b[32m', // Verde
      error: '\x1b[31m', // Rojo
      reset: '\x1b[0m' // Reset
    };
  
    let newMSG = '';
    
    if (code == 100) {
        newMSG = `${colors.info}${statusCodes[code] || '[Info]'}${colors.reset} ${message}`;
    } else if (code >= 200 && code < 300) {
      newMSG = `${colors.success}${statusCodes[code] || '[Exito]'}${colors.reset} ${message}`;
    } else if (code >= 400 && code < 500) {
      newMSG = `${colors.error}${statusCodes[code] || '[Client Error]'}${colors.reset} ${message}`;
    } else if (code >= 500) {
      newMSG = `${colors.error}${statusCodes[code] || '[Server Error]'}${colors.reset} ${message}`;
    } else {
      newMSG = `${colors.error}${message}${colors.reset}`;
    }
  
    return new Error(newMSG);
  }

module.exports = {
    addTweet,
    addRetweet,
    listTweets,
    like,
    dislike,

    print,
    printLog,
    printMsgLog
}