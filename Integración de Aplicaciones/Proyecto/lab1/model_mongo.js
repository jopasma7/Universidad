const mongodb = require('mongodb'); 
const MongoClient = mongodb.MongoClient; 
const url = 'mongodb://localhost:27017';
const database = 'twitter_lite';
const messages= require("./messages"); 


var colecciones = {
    users : "users",
    tweets : "tweets"
}

/*======================================================*/
/*                  USUARIOS >> LOGIN                   */
/*======================================================*/
/*  Esta función sirve para iniciar sesión en Twitter   */
/*           Requiere un <email> y <password>           */
/*    Devuelve un <cb> con el resultado. Indicando      */
/*         Si logró o falló la autentificación.         */

function login(email, password, cb) {  
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */           
        _cb = function (err, res, res2) {      
            client.close(); cb(err, res, res2);      
        }
        /* Crea la conexión a la base de datos */
        let db = client.db(database);    
        let col = db.collection(colecciones.users);    

        /* FindOne busca 1 valor con el <email> y <password> en la base de datos */
        /* Devolverá el resultado dentro del campo <user> del callback */
        col.findOne({ email: email, password: password }).then(_user => {      
            /* Revisamos si el usuario NO está registrado en la base de datos */
            if (!_user) {
                printWithLog(messages.cmd.login.invalid_credentials, 
                (messages.log.invalid_credentials.replace("%email%", email)
                .replace("%password%", password)), 0);              
                _cb(null); // Devuelve un Err:null, Token:undefined y User:undefined
            }else {      
                /* Como si está registrado hacemos las operaciones */
                /* Asignamos toda la información del usuario de la base de datos al usuario actual */
                _cb(null, _user._id.toHexString(), {         
                    id: _user._id.toHexString(), 
                    name: _user.name, 
                    surname: _user.surname,        
                    email: _user.email, 
                    password: _user.password,
                    nick: _user.nick
                });    
            }}).catch(err => {      
                _cb(err)    
            });  
    }).catch(err => {    
        cb(err);  
    }); 
}


/*======================================================*/
/*                 USUARIOS >> ADDUSER                  */
/*======================================================*/
/*  Esta función sirve para agregar nuevos usuarios a   */
/*          la base de datos de la aplicación           */
/*                  Requiere un <user>                  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*       Si logró o falló la creación del usuario       */

function addUser(user, cb) {  
    /* Realizamos una serie de comprobaciones para revisar si el <user> que nos pasaron */
    /* tiene todos los parámetros correctamente establecidos. */
    if(!user.name || !user.surname || !user.email || !user.nick || !user.password){
        print(messages.cmd.addUser.no_param, 0);
        cb(); return;
    }
    
    MongoClient.connect(url).then((client) => {           
        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */       
        _cb = function (err, res) {        
            client.close(); cb(err, res);        
        }
         /* Crea la conexión a la base de datos */
        let db = client.db(database);      
        let users = db.collection(colecciones.users);   
        
        /* Revisamos con FindOne si existe e1 usuario con el <email> y <password> en la base de datos */
        /* Para revisar si el usuario insertado ya existe en la Database */
        /* En caso de no existir creamos uno nuevo y si existe devolver error */
        users.findOne({$or:[{ email: user.email },{ nick: user.nick }] }).then((_user) => { 
                /* Si existe, Tenemos que devolver el callback avisando de que ya existe */
                /* Para ello vamos a mandarle un usuario undefined y haremos una comprobación posterior para evitar lanzar un error */ 
                if(_user){ 
                    if (_user.email == user.email) print(messages.cmd.addUser.email_exists, 0);
                    else if (_user.nick == user.nick) print(messages.cmd.addUser.nick_exists, 0);
                    _cb(null); return;
                }       
                /* Si no existe, hay que crear el usuario y devolverlo por el callback */
                user.following = []; 
                user.followers = []; 
                /* Ejecuta insertOne para crear e insertar el usuario en la base de datos */        
                users.insertOne(user).then(result => {              
                    _cb(null, {                
                        id: result.insertedId.toHexString(), name: user.name,                 
                        surname: user.surname, email: user.email, nick: user.nick              
                    });            
                }).catch(err => {              
                    _cb(err)            
                });       
            }).catch(err => {          
                _cb(err)        
            });      
    }).catch(err => {          
        _cb(err)        
    });
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

function updateUser(token, user, cb){
    /* Realizamos una serie de comprobaciones para revisar el <user> que nos pasaron */
    /* Si tiene algún parámetro... procederemos a realizar el cambio. */
    let booleanUser = {name : false, surname : false, email : false, password : false, nick : false }
   
    if(user.name && typeof user.name === 'string' && user.name.trim() !== '') booleanUser.name = true;
    if(user.surname && typeof user.surname === 'string' && user.surname.trim() !== '') booleanUser.surname = true;
    if(user.email && typeof user.email === 'string' && user.email.trim() !== '') booleanUser.email = true;
    if(user.password && typeof user.password === 'string' && user.password.trim() !== '') booleanUser.password = true;
    if(user.nick && typeof user.nick === 'string' && user.nick.trim() !== '') booleanUser.nick = true;
    
    /* Si no se ha insertado ningún parámetro devolvemos error */
    if(!booleanUser.name && !booleanUser.surname && !booleanUser.email && !booleanUser.password && !booleanUser.nick){
        print(messages.cmd.updateUser.no_param, 0);
        cb(null); return;
    }
    MongoClient.connect(url).then((client) => {        
        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */       
        _cb = function (err, res) {        
            client.close(); cb(err, res);          
        }
         /* Crea la conexión a la base de datos */
        let db = client.db(database);      
        let users = db.collection(colecciones.users);   
        
        // Si nos pidieron actualizar el parámetro Email.
        if(booleanUser.email){ /* Hay que realizar una búsqueda en la base de datos por si coincide con algún email de usuario ya registrado. */
            users.findOne({ email: user.email }).then((j) => {                        
                if(j){ print(messages.cmd.updateUser.email_exists,0); _cb(null); return; }               
            });    
        }

        // Si nos pidieron actualizar el parámetro nick.
        if(booleanUser.nick){ /* Hay que realizar una búsqueda en la base de datos por si coincide con algún nick de usuario ya registrado. */
            users.findOne({ nick: user.nick }).then((j) => {                        
                if(j){ print(messages.cmd.updateUser.nick_exists,0); _cb(null); return; }              
            });    
        }
        
        /* Recogemos con FindOne al usuario con el <token>:<token> en la base de datos */
        /* Lo usaremos para hacer los cambios */
        const consulta = {  _id: new mongodb.ObjectId(token)  };
        users.findOne(consulta).then((_user) => { 
            /* Si no existe devolvemos error y si existe actualizamos el usuario. */
            if(!_user){ print(messages.cmd.err.no_token, 0); _cb(); return; }                         
            if(booleanUser.name) _user.name = user.name;
            if(booleanUser.surname) _user.surname = user.surname;
            if(booleanUser.email) _user.email = user.email;
            if(booleanUser.password) _user.password = user.password;
            if(booleanUser.nick) _user.nick = user.nick;

            const update = { $set: { name: _user.name, surname: _user.surname, email: _user.email, password: _user.password, nick: _user.nick } };
            users.updateOne(consulta, update).then(result => { 
                if(result){
                    printWithLog(messages.cmd.updateUser.success, (messages.log.new_update
                        .replace("%name%",_user.name).replace("%surname%",_user.surname)
                        .replace("%email%",_user.email).replace("%nick%",_user.nick).replace("%password%",_user.password)), 1);            
                    _cb(null, _user);
                }else{
                    _cb(err) 
                }                                           
            }).catch(err => {              
                _cb(err)            
            });                                            
        }).catch(err => {          
            _cb(err)        
        });      
    }).catch(err => {          
        _cb(err)        
    });
}


/*======================================================*/
/*               USUARIOS >> LISTUSERS                  */
/*======================================================*/
/* Esta función sirve para listar a todos los usuarios  */
/*         de la base de datos de la aplicación         */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listUsers(token, opts, cb) {  
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */  
        _cb = function (err, res) {      
            client.close(); cb(err, res);     
        }   
        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos a buscar la query */
        users.findOne({ _id: new mongodb.ObjectId(token) }).then(_user => {      
            if (!_user) { print(messages.cmd.err.no_token, 0); _cb(null); return; } /* Mensaje de error */
                 
            let jsonQuery = {}; /* Variable para almacenar la query */
                if(opts.q && typeof opts.q === 'string' && opts.q.trim() !== ''){
                    const qu = opts.q.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a la clave.
                    .replace(/^'+|'+$/g, '') // Quita las comillas de fuera.
                    .replace(/'/g, '"');// Cambiar comillas simples por comillas dobles.
                     
                    try { jsonQuery = JSON.parse(qu); } // Parseamos para convertirlo en un JSON.
                    catch(err){ print(messages.cmd.listUsers.invalid_format, 0); _cb(null); return; } // Mensaje de inválid format JSON.              
                 }  

                 let _query = jsonQuery; let _opts = {};
                 if (opts.i) _opts.skip = opts.i;
                 if (opts.c) _opts.limit = opts.c;
                 if (opts.s && typeof opts.s === 'string' && opts.s.trim() !== '') _opts.s = [[opts.s.slice(1),(opts.s.charAt(0) == '+' ? 1 : -1)]];
                 users.find(_query, _opts).toArray().then(_results => {
                    if(_results.length == 0){
                        print(messages.cmd.listUsers.no_results, 2);
                        _cb(null); return;
                    }
                     let results = _results.map((user) => {            
                         return {              
                             id: user._id.toHexString(), name: user.name,              
                             surname: user.surname, email: user.email, nick: user.nick,  
                             following: user.following.length,  followers: user.followers.length         
                         };          
                     });          
                 _cb(null, results);        
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
/*             USUARIOS >> LISTFOLLOWING                */
/*======================================================*/
/* Esta función sirve para listar a todos los usuarios  */
/*         a los que el usuario sigue (follow)          */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listFollowing(token, opts, cb) {  
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */  
        _cb = function (err, res) {      
            client.close(); cb(err, res);                  
        }   
        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos a buscar la query */
        users.findOne({ _id: new mongodb.ObjectId(token) }).then(_user => {     
            if (!_user) { print(messages.cmd.err.no_token, 0); _cb(null); return; } /* Mensaje de error */ 
                
            let jsonQuery = {}; /* Variable para almacenar la query */
                if(opts.q && typeof opts.q === 'string' && opts.q.trim() !== ''){
                   const qu = opts.q.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a la clave.
                   .replace(/^'+|'+$/g, '') // Quita las comillas de fuera.
                   .replace(/'/g, '"');// Cambiar comillas simples por comillas dobles.
                     
                    try { jsonQuery = JSON.parse(qu); } // Parseamos para convertirlo en un JSON.
                    catch(err){ print(messages.cmd.listFollowing.invalid_format, 0); _cb(null); return; }  // Mensaje de inválid format JSON.                             
                }                          
                let _query = jsonQuery; let _opts = {};
                if (opts.i) _opts.skip = opts.i;
                if (opts.c) _opts.limit = opts.c;
                if (opts.s && typeof opts.s === 'string' && opts.s.trim() !== '') _opts.s = [[opts.s.slice(1),(opts.s.charAt(0) == '+' ? 1 : -1)]];
                users.find({ $and: [_query,{ _id: { $in: _user.following } }] }, _opts).toArray().then(usuarios => { 
                    if(usuarios.length == 0){
                        print(messages.cmd.listFollowing.no_results, 2);
                        _cb(null); return;
                    }
                    let results = usuarios.map((a) => { // Mapeamos el vector para mostrar únicamente los valores que queremos.        
                        return {              
                            id: a._id.toHexString(), name: a.name,              
                            surname: a.surname, email: a.email, nick: a.nick            
                        };          
                    });
                    _cb(null, results);
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
/*             USUARIOS >> LISTFOLLOWERS                */
/*======================================================*/
/*       Esta función sirve para listar a todos         */
/*     los usuarios que sigue el usuario (follow)       */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listFollowers(token, opts, cb) {  
    MongoClient.connect(url).then(client => {  

        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */  
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos a buscar la query */
        users.findOne({ _id: new mongodb.ObjectId(token) }).then(_user => {  
            /* Si no existe devuelve un mensaje de error */    
            if (!_user) { print(messages.cmd.err.no_token, 0); _cb(null);  return; }
            
            let jsonQuery = {}; //Variable para almacenar la query.
                if(opts.q && typeof opts.q === 'string' && opts.q.trim() !== ''){
                   const qu = opts.q.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a la clave.
                   .replace(/^'+|'+$/g, '') // Quita las comillas de fuera.
                   .replace(/'/g, '"');// Cambiar comillas simples por comillas dobles.
                     
                    try { jsonQuery = JSON.parse(qu); } // Parseamos para convertirlo en un JSON.
                    catch(err){ print(messages.cmd.listFollowers.invalid_format, 0); _cb(null); return; } // Mensaje de inválid format JSON.              
                }                          
                let _query = jsonQuery; let _opts = {};
                if (opts.i) _opts.skip = opts.i;
                if (opts.c) _opts.limit = opts.c;
                if (opts.s && typeof opts.s === 'string' && opts.s.trim() !== '') _opts.s = [[opts.s.slice(1),(opts.s.charAt(0) == '+' ? 1 : -1)]];
                users.find({ $and: [_query,{ _id: { $in: _user.followers } }] }, _opts).toArray().then(usuarios => { 
                    if(usuarios.length == 0){
                        print(messages.cmd.listFollowers.no_results, 2);
                        _cb(null); return;
                    }
                    let results = usuarios.map((a) => { // Mapeamos el vector para mostrar únicamente los valores que queremos.        
                        return {              
                            id: a._id.toHexString(), name: a.name,              
                            surname: a.surname, email: a.email, nick: a.nick            
                        };          
                    });
                    _cb(null, results);
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
/*                 USUARIOS >> FOLLOW                   */
/*======================================================*/
/*     Esta función sirve para seguir a otro usuario    */
/*                 Requiere un <token>                  */
/*      Necesita una ID del usuario para seguirle       */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de follow o no        */
function follow(token, userId, cb){
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        _cb = function (err) {      
            client.close();  cb(err);       
        }   
        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos */
        users.findOne({ _id: new mongodb.ObjectId(token) }).then(_user => {      
             /* Si no existe el Token envía un mensaje de error y devuelve el cb */
            if (!_user) { print(messages.cmd.err.no_token, 0); _cb(null);  return; }
            /* Revisaremos si el usuario al que queremos seguir existe en la base de datos */            
            users.findOne({ _id: new mongodb.ObjectId(userId) }).then(_userId => {      
                /* Si no existe el UserID envía un mensaje de error y devuelve el cb */
                if (!_userId) { print((messages.cmd.follow.no_exists.replace("%userID%",userId)), 0); _cb(null); return; }
                    /* Como si que está en la base de datos, procederemos a hacer el follow */
                    /* Pero antes tenemos que revisar si el usuario ya es follower de ese usuario */
                    if(_userId.followers.map(id => id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                       print(messages.cmd.follow.already_follow, 0); _cb(null); return;  /* Error : Ya tienes follow con esa persona */
                    }
                    /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                    users.updateOne({ _id: new mongodb.ObjectId(userId) }, { $push: { followers: _user._id } } ).then(result => { /* Agrega el nuevo usuario al array de followers*/
                    if(result){                                    
                        /* Ya tenemos nuestro nombre agregado en la lista de followers del usuario. */
                        /* Ahora falta agregar su nombre a nuestra lista de following */
                        users.updateOne({ _id: new mongodb.ObjectId(token) }, 
                            { $push: { following: _userId._id } }).then(resu => { /* Agrega el nuevo usuario al array de followings*/
                            if(resu){
                                /* Todo correcto : Manda un mensaje de Follow Complete */
                                printWithLog((messages.cmd.follow.success.replace("%nick%",_userId.nick)),
                                (messages.log.new_follow.replace("%user_nick%",_user.nick).replace("%target_nick%",_userId.nick)),1);
                                /* Ya tenemos nuestro nombre agregado en la lista de followers del usuario. */
                                /* Ahora falta agregar su nombre a nuestra lista de following */
                                _cb(null);
                            }else _cb(err);                                          
                        }).catch(err => {              
                            _cb(err)            
                        });
                    }else _cb(err);                                             
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
/*               USUARIOS >> UNFOLLOW                   */
/*======================================================*/
/* La función sirve para dejar de seguir a otro usuario */
/*                 Requiere un <token>                  */
/*  Necesita una ID del usuario para dejar de seguirle  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de unfollow o no      */
function unfollow(token, userId, cb){
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        _cb = function (err) {      
            client.close(); cb(err);    
        }   
        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos */
        users.findOne({ _id: new mongodb.ObjectId(token) }).then(_user => {      
            /* Si no existe el Token envía un mensaje de error y devuelve el cb */
            if (!_user) { print(messages.cmd.err.no_token, 0); _cb(null); return;  }
            /* Revisaremos si el usuario al que queremos seguir existe en la base de datos */            
            users.findOne({ _id: new mongodb.ObjectId(userId) }).then(_userId => {   
                /* Si no existe el UserID envía un mensaje de error y devuelve el cb */
                if (!_userId) { print((messages.cmd.unfollow.no_exists.replace("%userID%",userId)), 0); _cb(null); return; }                    
                    /* Como si que está en la base de datos, procederemos a hacer el unfollow */
                    /* Pero antes tenemos que revisar si el usuario ya es follower de ese usuario y eliminarlo si lo es */
                    if(!_userId.followers.map(id => id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                        print(messages.cmd.unfollow.not_follow, 0); _cb(null); return;  /* Error : No sigues a esa persona */
                    }

                    /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                    users.updateOne({ _id: new mongodb.ObjectId(userId) }, { $pull: { followers: _user._id } } ).then(result => { /* Agrega el nuevo usuario al array */
                    if(result){
                        /* Ya tenemos nuestro id removido en la lista de followers del usuario. */
                        /* Ahora falta remover su id de nuestra lista de following */                            
                        users.updateOne({ _id: new mongodb.ObjectId(token) }, 
                            { $pull: { following: _userId._id } } /* Agrega el nuevo usuario al array */
                        ).then(resu => { 
                            if(resu){
                                /* Todo correcto : Manda un mensaje de UnFollow Complete */
                                printWithLog((messages.cmd.unfollow.success.replace("%nick%",_userId.nick)),
                                (messages.log.new_unfollow.replace("%user_nick%",_user.nick).replace("%target_nick%",_userId.nick)),1);
                                _cb(null);
                            }else _cb(err)                                              
                        }).catch(err => {              
                            _cb(err)            
                        });     
                    }else _cb(err)                                               
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
/*               MENSAJES >> ADDTWEET                   */
/*======================================================*/
/*          Agregar un nuevo Mensaje de Tweet           */
/*                Requiere un <token>                   */
/*    Contiene el contendo del mensaje en <content>     */
/*          Devuelve un <cb> con el resultado.          */

function addTweet(token, content, cb){
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let tweets = db.collection(colecciones.tweets); 
        let users = db.collection(colecciones.users);   

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos */
        users.findOne({ _id: new mongodb.ObjectId(token) })
        .then(_user => {      
             /* Si no existe el Token envía un mensaje de error y devuelve el cb */
            if (!_user) { print(messages.cmd.err.no_token, 0); _cb(null); return; }
            
            /* Creación de Tweet : Estructura */
            //console.log(content);
            let contentMsg = content.replace(/'/g, '');
            let tweet = {
                owner : {
                    id : _user._id,
                    name : _user.name + " " + _user.surname,
                    nick : _user.nick
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
        }).catch(err => {      
            _cb(err)    
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
        _cb = function (err) {      
            client.close();      
            cb(err);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users); 
        let tweets = db.collection(colecciones.tweets);     

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos */
        users.findOne({ _id: new mongodb.ObjectId(token) }).then(_user => { 
            if (!_user) {
                /* Si no existe el Token envía un mensaje de error y devuelve el cb */
                print(messages.cmd.err.no_token, 0);
                _cb(null); return; 
            }
            /* Revisaremos si el Tweet al que queremos dar Retweet existe en la base de datos */            
            tweets.findOne({ _id: new mongodb.ObjectId(tweetId) }).then(tw => {
                if (!tw) {
                    /* Si no existe el TweetID envía un mensaje de error y devuelve el cb */
                    print((messages.cmd.addRetweet.no_exists.replace("%tweetID%",tweetId)), 0);
                    _cb(null); return;  
                }
                /* Tenemos que revisar que no se pueda dar retweet la misma persona a su propio tweet */
                if(tw.owner.id.toString() === _user._id.toHexString()){
                    print(messages.cmd.addRetweet.your_tweet, 0);
                    _cb(null);  return;  
                }
                /* Como si que está en la base de datos, procederemos a hacer el retweet */
                /* Pero antes tenemos que revisar si el usuario ya ha dado retweet previamente a ese mensaje */
                if(tw.retweets.map(id => id.id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                    /* Error : Ya hiciste retweet de ese mensaje */
                    print(messages.cmd.addRetweet.already_retweet, 0);
                    _cb(null); return;
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
                            /* Todo correcto : Manda un mensaje de retweet Complete */
                            printWithLog((messages.cmd.addRetweet.success.replace("%nick%",tw.owner.nick)),
                            (messages.log.new_retweet.replace("%nick_retweet%",_user.nick).replace("%owner_nick%",tw.owner.nick)
                            .replace("%content%",tw.content).replace("%tweetID%",tweetId)),1);
                            _cb(null);
                        }else _cb(err);
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
        let users = db.collection(colecciones.users);  
        let tweets = db.collection(colecciones.tweets);   

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos a buscar la query */
        users.findOne({ _id: new mongodb.ObjectId(token) }).then(_user => {      
            if (!_user) { print(messages.cmd.err.no_token, 0); _cb(null); return; }

            let jsonQuery = {};
            if(opts.q && typeof opts.q === 'string' && opts.q.trim() !== ''){
                const qu = opts.q.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a la clave.
                    .replace(/^'+|'+$/g, '') // Quita las comillas de fuera.
                    .replace(/'/g, '"');// Cambiar comillas simples por comillas dobles.
                        
                try { jsonQuery = JSON.parse(qu); } // Parseamos para convertirlo en un JSON.
                catch(err){ print(messages.cmd.listTweets.invalid_format, 0); _cb(null); return; } // Mensaje de inválid format JSON.        
            }  

            let _query = jsonQuery; let _opts = {};
            if (opts.i) _opts.skip = opts.i;
            if (opts.c) _opts.limit = opts.c;
            if (opts.s && typeof opts.s === 'string' && opts.s.trim() !== '') _opts.s = [[opts.s.slice(1),(opts.s.charAt(0) == '+' ? 1 : -1)]];
            tweets.find(_query, _opts).toArray().then(tweet => { 
                if(tweet.length == 0){
                    print(messages.cmd.listTweets.no_results, 2);
                    _cb(null); return;
                }
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
        _cb = function (err) {      
            client.close();      
            cb(err);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users); 
        let tweets = db.collection(colecciones.tweets);     

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos */
        users.findOne({ _id: new mongodb.ObjectId(token) })
        .then(_user => { 
            if (!_user) {
                /* Si no existe el Token envía un mensaje de error y devuelve el cb */
                print(messages.cmd.err.no_token, 0);
                _cb(null); return; 
            }
            /* Revisaremos si el Tweet al que queremos dar like existe en la base de datos */            
            tweets.findOne({ _id: new mongodb.ObjectId(tweetId) }).then(tw => {
                if (!tw) {
                    /* Si no existe el TweetID envía un mensaje de error y devuelve el cb */
                    print((messages.cmd.like.no_exists.replace("%tweetID%",tweetId)), 0);
                    _cb(null); return;  
                }
                /* Tenemos que revisar que no se pueda dar like la misma persona a su propio tweet */
                if(tw.owner.id.toString() === _user._id.toHexString()){
                    print(messages.cmd.like.your_tweet, 0);
                    _cb(null);  return;  
                }
                /* Como si que está en la base de datos, procederemos a hacer el like */
                /* Pero antes tenemos que revisar si el usuario ya ha dado like previamente a ese mensaje */
                if(tw.like.map(id => id.id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                    /* Error : Ya tienes like a ese mensaje */
                    print(messages.cmd.like.already_like, 0);
                    _cb(null); return;
                }
                let lk = { id : _user._id, nick : _user.nick }

                 /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                tweets.updateOne({ _id: new mongodb.ObjectId(tweetId) }, 
                    {
                        $push: { like: lk },
                        $pull: { dislike: { id: { $in: [_user._id] } }  }
                    }
                    ).then(result => {  /* Agrega el nuevo usuario al array de likes*/
                    
                        if(result){                                    
                            /* Ya tenemos nuestro nombre agregado en la lista likes del Tweet. */
                            /* Todo correcto : Manda un mensaje de like Complete */
                            printWithLog((messages.cmd.like.success.replace("%nick%",tw.owner.nick)),
                            (messages.log.new_like.replace("%user_liked%",_user.nick).replace("%owner_nick%",tw.owner.nick)
                            .replace("%content%",tw.content).replace("%tweetID%",tweetId)),1);
                            _cb(null);
                        }else _cb(err);
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
        _cb = function (err) {      
            client.close();      
            cb(err);    
        }   
        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users); 
        let tweets = db.collection(colecciones.tweets);     

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos */
        users.findOne({ _id: new mongodb.ObjectId(token) })
        .then(_user => { 
            if (!_user) {
                /* Si no existe el Token envía un mensaje de error y devuelve el cb */
                print(messages.cmd.err.no_token, 0);
                _cb(null); return; 
            }
            /* Revisaremos si el Tweet al que queremos dar dislike existe en la base de datos */            
            tweets.findOne({ _id: new mongodb.ObjectId(tweetId) }).then(tw => {
                if (!tw) {
                    /* Si no existe el TweetID envía un mensaje de error y devuelve el cb */
                    print((messages.cmd.dislike.no_exists.replace("%tweetID%",tweetId)), 0);
                    _cb(null); return;  
                }
                /* Tenemos que revisar que no se pueda dar dislike la misma persona a su propio tweet */
                if(tw.owner.id.toString() === _user._id.toHexString()){
                    print(messages.cmd.dislike.your_tweet, 0);
                    _cb(null);  return;  
                }
                /* Como si que está en la base de datos, procederemos a hacer el dislike */
                /* Pero antes tenemos que revisar si el usuario ya ha dado dislike previamente a ese mensaje */
                if(tw.dislike.map(id => id.id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                    /* Error : Ya tienes dislike a ese mensaje */
                    print(messages.cmd.dislike.already_dislike, 0);
                    _cb(null); return;
                }

                let lk = {  id : _user._id,  nick : _user.nick }

                 /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                tweets.updateOne({ _id: new mongodb.ObjectId(tweetId) }, 
                    {
                        $push: { dislike: lk },
                        $pull: { like: { id: { $in: [_user._id] } }  }
                    }
                    ).then(result => {  /* Agrega el nuevo usuario al array de dislikes*/
                    
                        if(result){                                    
                            /* Ya tenemos nuestro nombre agregado en la lista dislikes del Tweet. */
                            /* Todo correcto : Manda un mensaje de dislike Complete */
                            printWithLog((messages.cmd.dislike.success.replace("%nick%",tw.owner.nick)),
                            (messages.log.new_dislike.replace("%user_disliked%",_user.nick).replace("%owner_nick%",tw.owner.nick)
                            .replace("%content%",tw.content).replace("%tweetID%",tweetId)),1);
                            _cb(null);
                        }else _cb(err);
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

/* Imprime un mensaje con colores más un Log al final */
function printWithLog(message, logMessage, color){
    print(message, color);
    console.log('\x1b[90m%s\x1b[0m','[LOG] \x1b[3m'+logMessage+'\x1b[0m');
}

/* Imprime un mensaje con colores */
function print(message, color){
    switch(color){
        case 0: console.log('\x1b[31m[Error]\x1b[0m ' + message);
        break;
        case 1: console.log('\x1b[32m[Éxito]\x1b[0m ' + message);
        break;
        case 2: console.log('\x1b[34m[Info]\x1b[0m ' + message);
        break;
    }
}


module.exports = {
    addUser,    
    login,    
    listUsers,
    updateUser,
    follow,
    unfollow,
    listFollowing,
    listFollowers,
    addTweet,
    addRetweet,
    listTweets,
    like,
    dislike,
}