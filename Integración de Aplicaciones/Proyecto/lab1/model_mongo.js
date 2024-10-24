const mongodb = require('mongodb'); 
const MongoClient = mongodb.MongoClient; 
const url = 'mongodb://localhost:27017';
const database = 'twitter_lite';
const messages= require("./messages"); 


var colecciones = {
    users : "users",
    messages : "messages"
}

/*                   Función de Login                   */
/*           -------------------------------            */
/*  Esta función sirve para iniciar sesión en Twitter   */
/*           Requiere un <email> y <password>           */
/*    Devuelve un <cb> con el resultado. Indicando      */
/*         Si logró o falló la autentificación.         */

function login(email, password, cb) {  
    MongoClient.connect(url).then(client => {  
        /* Crear un nuevo callback llamado _cb que hace lo mismo */
        /* que el cb normal pero también cierra la conexión */           
        _cb = function (err, res, res2) {      
            client.close();      
            cb(err, res, res2);    
        }  

        /* Crea la conexión a la base de datos */
        let db = client.db(database);    
        let col = db.collection(colecciones.users);    

        /* FindOne busca 1 valor con el <email> y <password> en la base de datos */
        /* Devolverá el resultado dentro del campo <user> del callback */
        col.findOne({ email: email, password: password }).then(_user => {      
            /* Revisamos si el usuario NO está registrado en la base de datos */
            if (!_user) {
                print(messages.login.invalid_credentials, 
                (messages.login.log.invalid_credentials.replace("%email%", email)
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


/*             Función para Añadir Usuario              */
/*         -----------------------------------          */
/*  Esta función sirve para agregar nuevos usuarios a   */
/*          la base de datos de la aplicación           */
/*                  Requiere un <user>                  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*       Si logró o falló la creación del usuario       */

function addUser(user, cb) {  

    /* Realizamos una serie de comprobaciones para revisar si el <user> que nos pasaron */
    /* tiene todos los parámetros correctamente establecidos. */
    if((user.name == undefined || !user.name) || (user.surname == undefined || !user.surname) || 
    (user.email == undefined || !user.email) || (user.nick == undefined || !user.nick) || 
    (user.password == undefined || !user.password)){
        print(messages.modify.no_param, messages.modify.log.cancel_add_no_param, 0);
        cb();
    }else{
        MongoClient.connect(url).then((client) => {      
        
            /* Crear un nuevo callback llamado _cb que hace lo mismo */
            /* que el cb normal pero también cierra la conexión */       
            _cb = function (err, res) {        
                client.close();        
                cb(err, res);      
            }
    
             /* Crea la conexión a la base de datos */
            let db = client.db(database);      
            let users = db.collection(colecciones.users);   
            
            /* Revisamos con FindOne si existe e1 usuario con el <email> y <password> en la base de datos */
            /* Para revisar si el usuario insertado ya existe en la Database */
            /* En caso de no existir creamos uno nuevo y si existe devolver error */
            users.findOne({$or:[{ email: user.email },{ nick: user.nick }] })
                .then((_user) => { 
                    /* Si existe, Tenemos que devolver el callback avisando de que ya existe */
                    /* Para ello vamos a mandarle un usuario undefined y haremos una comprobación posterior para evitar lanzar un error */ 
                    if(_user){ 
                        if (_user.email == user.email) print(messages.modify.email_exists, (messages.modify.log.user_exists.replace("%email%",user.email).replace("%nick%",user.nick)), 0);
                        else if (_user.nick == user.nick) print(messages.modify.nick_exists, (messages.modify.log.user_exists.replace("%email%",user.email).replace("%nick%",user.nick)), 0);
                        _cb(null); 
                    }       
                    /* Si no existe, hay que crear el usuario y devolverlo por el callback */
                    else {            
                        user.following = []; 
                        /* Ejecuta insertOne para crear e insertar el usuario en la base de datos */        
                        users.insertOne(user).then(result => {              
                            _cb(null, {                
                                id: result.insertedId.toHexString(), name: user.name,                 
                                surname: user.surname, email: user.email, nick: user.nick              
                            });            
                        }).catch(err => {              
                            _cb(err)            
                        });          
                    }        
                }).catch(err => {          
                    _cb(err)        
                });      
        }).catch(err => {          
            _cb(err)        
        });
    }   
}

/*           Función para Cambiar Usuarios              */
/*        -----------------------------------           */
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
   
    if(user.name != undefined) booleanUser.name = true;
    if(user.surname != undefined) booleanUser.surname = true;
    if(user.email != undefined) booleanUser.email = true;
    if(user.password != undefined) booleanUser.password = true;
    if(user.nick != undefined) booleanUser.nick = true;
    
    if(user.name || user.surname || user.email || user.password || user.nick){
            MongoClient.connect(url).then((client) => {      
        
                /* Crear un nuevo callback llamado _cb que hace lo mismo */
                /* que el cb normal pero también cierra la conexión */       
                _cb = function (err, res) {        
                    client.close();        
                    cb(err, res);      
                }
        
                 /* Crea la conexión a la base de datos */
                let db = client.db(database);      
                let users = db.collection(colecciones.users);   
                
                /* Recogemos con FindOne al usuario con el <token>:<token> en la base de datos */
                /* Lo usaremos para hacer los cambios */
                /* En caso de no existir creamos uno nuevo y si existe devolver error */
                const consulta = {  _id: new mongodb.ObjectId(token)  };
                users.findOne(consulta)
                    .then((_user) => { 
                        /* Si existe, Actualizaremos los datos que nos pasaron al usuario */
                        if(_user){                             
                            if(booleanUser.name) _user.name = user.name;
                            if(booleanUser.surname) _user.surname = user.surname;
                            if(booleanUser.email) _user.email = user.email;
                            if(booleanUser.password) _user.password = user.password;
                            if(booleanUser.nick) _user.nick = user.nick;

                            const update = { $set: { name: _user.name, surname: _user.surname, email: _user.email, password: _user.password, nick: _user.nick } };
                            users.updateOne(consulta, update).then(result => { 
                                if(result){
                                    print(messages.modify.user_updated, (messages.modify.log.user_updated
                                        .replace("%name%",_user.name).replace("%surname%",_user.surname)
                                        .replace("%email%",_user.email).replace("%nick%",_user.nick).replace("%password%",_user.password)), 1);            
                                    _cb(null, _user);
                                }else{
                                    _cb(err) 
                                }                                           
                            }).catch(err => {              
                                _cb(err)            
                            });
                            
                        }       
                        /* Si no existe, es que el token es inválido y devolveremos error */
                        else {
                            print(messages.token.no_logged, (messages.token.log_no_token.replace("%token%",token)),0);
                            _cb() 
                        }

                    }).catch(err => {          
                        _cb(err)        
                    });      
            }).catch(err => {          
                _cb(err)        
            });
    }else{
        /* Si no tiene ningún parámetro devolveremos error. */
        print(messages.modify.no_param, messages.modify.log.cancel_add_no_param, 0);
        cb(null);
    }
}


/*            Función para Listar Usuarios              */
/*        -----------------------------------           */
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
            client.close();      
            cb(err, res);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos a buscar la query */
        users.findOne({ _id: new mongodb.ObjectId(token) })
        .then(_user => {      
            if (!_user) {
                print(messages.token.no_logged, (messages.token.log_no_token.replace("%token%",token)),0);
                _cb(null);  
            }else {        
                // adapt query 
                let jsonQuery = {};
                if(opts.q){
                    const qu = opts.q.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a las claves.
                    .replace(/'/g, '"'); // Cambiar comillas simples por comillas dobles.
                    jsonQuery = JSON.parse(qu); // Parseamos para convertirlo en un JSON.
                }              
            
                let _query = jsonQuery;
                // adapt options
                let _opts = {};
                if (opts.ini) _opts.skip = opts.ini;
                if (opts.count) _opts.limit = opts.count;
                if (opts.sort) _opts.sort = [[opts.sort.slice(1),
                (opts.sort.charAt(0) == '+' ? 1 : -1)]];
                users.find(_query, _opts).toArray().then(_results => {
                    let results = _results.map((user) => {            
                        return {              
                            id: user._id.toHexString(), name: user.name,              
                            surname: user.surname, email: user.email, nick: user.nick            
                        };          
                    });          
                    _cb(null, results);        
                }).catch(err => {          
                    _cb(err)        
                });      
            }    
        }).catch(err => {      
            _cb(err)    
        });  
    }).catch(err => {    
        cb(err);  
    }); 
}

/*            Función para seguir Usuarios              */
/*        -----------------------------------           */
/*     Esta función sirve para seguir a otro usuario    */
/*                 Requiere un <token>                  */
/*      Necesita una ID del usuario para seguirle       */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de follow o no        */
function follow(token, userId, cb){
    MongoClient.connect(url).then(client => {  

        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        _cb = function (err) {      
            client.close();      
            cb(err);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos */
        users.findOne({ _id: new mongodb.ObjectId(token) })
        .then(_user => {      
            if (!_user) {
                /* Si no existe el Token envía un mensaje de error y devuelve el cb */
                print(messages.token.no_logged, (messages.token.log_no_token.replace("%token%",token)),0);
                _cb(null);  
            }else {        
                /* Revisaremos si el usuario al que queremos seguir existe en la base de datos */            
                users.findOne({ _id: new mongodb.ObjectId(userId) }).then(_userId => {      
                    if (!_userId) {
                        /* Si no existe el UserID envía un mensaje de error y devuelve el cb */
                        print((messages.follows.no_exists.replace("%userID%",userId)), (messages.follows.log.err.replace("%nick%",_user.nick)),0);
                        _cb(null);  
                    }else {        
                        /* Como si que está en la base de datos, procederemos a hacer el follow */
                        /* Pero antes tenemos que revisar si el usuario ya es follower de ese usuario */
                        if(!_userId.following.includes(_user.nick)){
                             /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                            users.updateOne(
                                { _id: new mongodb.ObjectId(userId) }, 
                                { $push: { following: _user.nick } } /* Agrega el nuevo usuario al array */
                            ).then(result => { 
                                if(result){
                                    /* Todo correcto : Manda un mensaje de Follow Complete */
                                    print((messages.follows.complete.replace("%nick%",_userId.nick)),
                                    (messages.follows.log.complete.replace("%user_nick%",_user.nick).replace("%target_nick%",_userId.nick)),1);
                                    _cb(null);
                                }else{
                                    _cb(err) 
                                }                                           
                            }).catch(err => {              
                                _cb(err)            
                            });    
                        }else{
                            /* Error : Ya tienes follow con esa persona */
                            print(messages.follows.already_follow,(messages.follows.log.err.replace("%nick%",_user.nick)),0);
                            _cb(null);
                        }                      
                    }    
                }).catch(err => {      
                    _cb(err)    
                });
            }    
        }).catch(err => {      
            _cb(err)    
        });  
    }).catch(err => {    
        cb(err);  
    }); 
}

/*        Función para dejar de seguir Usuarios         */
/*        -----------------------------------           */
/* La función sirve para dejar de seguir a otro usuario */
/*                 Requiere un <token>                  */
/*  Necesita una ID del usuario para dejar de seguirle  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de unfollow o no      */
function unfollow(token, userId, cb){
    MongoClient.connect(url).then(client => {  

        /* Crear un nuevo callback llamado _cb que hace lo mismo que el cb normal pero también cierra la conexión */
        _cb = function (err) {      
            client.close();      
            cb(err);    
        }   

        /* Creamos la conexión a la base de datos */ 
        let db = client.db(database);    
        let users = db.collection(colecciones.users);    

        /* Utilizamos findOne para encontrar en la base de datos el usuario que está ejecutando la consulta */
        /* Si el usuario está en la base de datos es una consulta válida y procedemos */
        users.findOne({ _id: new mongodb.ObjectId(token) })
        .then(_user => {      
            if (!_user) {
                /* Si no existe el Token envía un mensaje de error y devuelve el cb */
                print(messages.token.no_logged, (messages.token.log_no_token.replace("%token%",token)),0);
                _cb(null);  
            }else {        
                /* Revisaremos si el usuario al que queremos seguir existe en la base de datos */            
                users.findOne({ _id: new mongodb.ObjectId(userId) }).then(_userId => {      
                    if (!_userId) {
                        /* Si no existe el UserID envía un mensaje de error y devuelve el cb */
                        print((messages.follows.no_exists.replace("%userID%",userId)), (messages.follows.log.err.replace("%nick%",_user.nick)),0);
                        _cb(null);  
                    }else {        
                        /* Como si que está en la base de datos, procederemos a hacer el unfollow */
                        /* Pero antes tenemos que revisar si el usuario ya es follower de ese usuario y eliminarlo si lo es */
                        if(_userId.following.includes(_user.nick)){
                             /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                            users.updateOne(
                                { _id: new mongodb.ObjectId(userId) }, 
                                { $pull: { following: _user.nick } } /* Agrega el nuevo usuario al array */
                            ).then(result => { 
                                if(result){
                                    /* Todo correcto : Manda un mensaje de UnFollow Complete */
                                    print((messages.follows.unfollow_complete.replace("%nick%",_userId.nick)),
                                    (messages.follows.log.unfollow_complete.replace("%user_nick%",_user.nick).replace("%target_nick%",_userId.nick)),1);
                                    _cb(null);
                                }else{
                                    _cb(err) 
                                }                                           
                            }).catch(err => {              
                                _cb(err)            
                            });    
                        }else{
                            /* Error : No sigues a esa persona */
                            print(messages.follows.not_follow,(messages.follows.log.err.replace("%nick%",_user.nick)),0);
                            _cb(null);
                        }                      
                    }    
                }).catch(err => {      
                    _cb(err)    
                });
            }    
        }).catch(err => {      
            _cb(err)    
        });  
    }).catch(err => {    
        cb(err);  
    }); 
}

// Mensaje de info para los mensajes informativos. >> Color azul.
function info(message){
    console.log('\x1b[34m[Info]\x1b[0m ' + message);
}

// Mensaje de éxitos para los resultados correctos. >> Color verde.
function success(message){
    console.log('\x1b[32m[Éxito]\x1b[0m ' + message);
}

// Mensaje de error para los resultados erróneos. >> Color rojo.
function error(message){
    //console.log('\x1b[31m%s\x1b[0m',message);
    console.log('\x1b[31m[Error]\x1b[0m ' + message);
}

// Mensaje de LOG para los resultados erróneos. >> Color rojo y cursiva.
function log(message){
    console.log('\x1b[90m%s\x1b[0m','[LOG] \x1b[3m'+message+'\x1b[0m');
}

function print(message, logMessage, color){
    switch(color){
        case 0: error(message);
        break;
        case 1: success(message);
        break;
        case 2: info(message);
        break;
    }
    log(logMessage);
}


module.exports = {
    addUser,    
    login,    
    listUsers,
    updateUser,
    follow,
    unfollow
}