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
        print(messages.cmd.addUser.no_param, 0);
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
                        if (_user.email == user.email) print(messages.cmd.addUser.email_exists, 0);
                        else if (_user.nick == user.nick) print(messages.cmd.addUser.nick_exists, 0);
                        _cb(null); 
                    }       
                    /* Si no existe, hay que crear el usuario y devolverlo por el callback */
                    else {            
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
                
                // Si nos pidieron actualizar el parámetro Email.
                // Hay que realizar una búsqueda en la base de datos por si coincide con algún usuario ya registrado.
                if(booleanUser.email){
                    users.findOne({ email: user.email }).then((j) => {                        
                        if(j){ print(messages.cmd.updateUser.email_exists,0); _cb(null);
                            return;
                        }              
                    });    
                }

                // Si nos pidieron actualizar el parámetro nick.
                // Hay que realizar una búsqueda en la base de datos por si coincide con algún usuario ya registrado.
                if(booleanUser.nick){
                    users.findOne({ nick: user.nick }).then((j) => {                        
                        if(j){ print(messages.cmd.updateUser.nick_exists,0); _cb(null);
                            return;
                        }              
                    });    
                }
                
                /* Recogemos con FindOne al usuario con el <token>:<token> en la base de datos */
                /* Lo usaremos para hacer los cambios */
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
                            
                        }       
                        /* Si no existe, es que el token es inválido y devolveremos error */
                        else {
                            print(messages.cmd.err.no_token, 0);
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
        print(messages.cmd.updateUser.no_param, 0);
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
                print(messages.cmd.err.no_token, 0);
                _cb(null);  
            }else { 
                 let jsonQuery = {};
                 if(opts.q){
                    const qu = opts.q.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a la clave.
                    .replace(/^'+|'+$/g, '') // Quita las comillas de fuera.
                    .replace(/'/g, '"');// Cambiar comillas simples por comillas dobles.
                     
                    try { jsonQuery = JSON.parse(qu); } // Parseamos para convertirlo en un JSON.
                     catch(err){
                        print(messages.cmd.listUsers.invalid_format, 0); // Mensaje de inválid format JSON.
                        _cb(null);
                        return;
                     }          
                 }                          
                 let _query = jsonQuery; let _opts = {};
                 if (opts.i) _opts.skip = opts.i;
                 if (opts.c) _opts.limit = opts.c;
                 if (opts.s) _opts.s = [[opts.s.slice(1),
                 (opts.s.charAt(0) == '+' ? 1 : -1)]];
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

/*       Función para Listar Usuarios que sigues        */
/*        -----------------------------------           */
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
                print(messages.cmd.err.no_token, 0);
                _cb(null);  
            }else { 
                let followingList = _user.following;
                console.log("user: "+_user.following);
                console.log("following array: "+followingList);
                users.find({ following: { $in: followingList } }).toArray().then(users => { // Esto nos da un vector de usuarios.
                    console.log("Usuarios que sigues: "+users);
                }).catch(err => {          
                    _cb(err)        
                });

                let jsonQuery = {};
                if(opts.q){
                   const qu = opts.q.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a la clave.
                   .replace(/^'+|'+$/g, '') // Quita las comillas de fuera.
                   .replace(/'/g, '"');// Cambiar comillas simples por comillas dobles.
                     
                    try { jsonQuery = JSON.parse(qu); } // Parseamos para convertirlo en un JSON.
                    catch(err){
                        print(messages.cmd.listUsers.invalid_format, 0); // Mensaje de inválid format JSON.
                        _cb(null);
                        return;
                    }          
                 }                          
                 let _query = jsonQuery; let _opts = {};
                 if (opts.i) _opts.skip = opts.i;
                 if (opts.c) _opts.limit = opts.c;
                 if (opts.s) _opts.s = [[opts.s.slice(1),
                 (opts.s.charAt(0) == '+' ? 1 : -1)]];
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
                print(messages.cmd.err.no_token, 0);
                _cb(null);  
            }else {        
                /* Revisaremos si el usuario al que queremos seguir existe en la base de datos */            
                users.findOne({ _id: new mongodb.ObjectId(userId) }).then(_userId => {      
                    if (!_userId) {
                        /* Si no existe el UserID envía un mensaje de error y devuelve el cb */
                        print((messages.cmd.follow.no_exists.replace("%userID%",userId)), 0);
                        _cb(null);  
                    }else {        
                        /* Como si que está en la base de datos, procederemos a hacer el follow */
                        /* Pero antes tenemos que revisar si el usuario ya es follower de ese usuario */
                        if(!_userId.followers.map(id => id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                             /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                            users.updateOne({ _id: new mongodb.ObjectId(userId) }, 
                                { $push: { followers: _user._id } } /* Agrega el nuevo usuario al array de followers*/
                            ).then(result => { 
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
                                        }else{
                                            _cb(err) 
                                        }                                           
                                    }).catch(err => {              
                                        _cb(err)            
                                    });
                                }else{
                                    _cb(err) 
                                }                                           
                            }).catch(err => {              
                                _cb(err)            
                            });    
                        }else{
                            /* Error : Ya tienes follow con esa persona */
                            print(messages.cmd.follow.already_follow, 0);
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
                print(messages.cmd.err.no_token, 0);
                _cb(null);  
            }else {        
                /* Revisaremos si el usuario al que queremos seguir existe en la base de datos */            
                users.findOne({ _id: new mongodb.ObjectId(userId) }).then(_userId => {      
                    if (!_userId) {
                        /* Si no existe el UserID envía un mensaje de error y devuelve el cb */
                        print((messages.cmd.unfollow.no_exists.replace("%userID%",userId)), 0);
                        _cb(null);  
                    }else {        
                        /* Como si que está en la base de datos, procederemos a hacer el unfollow */
                        /* Pero antes tenemos que revisar si el usuario ya es follower de ese usuario y eliminarlo si lo es */
                        if(_userId.followers.map(id => id.toString()).includes(new mongodb.ObjectId(_user._id).toString())){
                             /* Usaremos updateOne para actualizar el valor directamente en la base de datos sin recogerlo */
                            users.updateOne({ _id: new mongodb.ObjectId(userId) }, 
                                { $pull: { followers: _user._id } } /* Agrega el nuevo usuario al array */
                            ).then(result => { 
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
                                        }else{
                                            _cb(err) 
                                        }                                           
                                    }).catch(err => {              
                                        _cb(err)            
                                    });     
                                }else{
                                    _cb(err) 
                                }                                           
                            }).catch(err => {              
                                _cb(err)            
                            });    
                        }else{
                            /* Error : No sigues a esa persona */
                            print(messages.cmd.unfollow.not_follow, 0);
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
}