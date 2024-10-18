const mongodb = require('mongodb'); 
const MongoClient = mongodb.MongoClient; 
const url = 'mongodb://localhost:27017';
const database = 'twitter_lite';


var colecciones = {
    users : "users",
    messages : "messages"
}

var lang = {
    log : {

    },
    add : {
        error : {
            no_name : ">> Debes introducir un nombre.",
            no_surname : ">> Debes introducir un apellido.",
            no_email : ">> Debes introducir un email.",
            no_nick : ">> Debes introducir un nick.",
            no_password : ">> Debes introducir una contraseña.",
        }
    },
    list : {

    },
    remove : {

    },
    update : {

    },
    login : {
        log: {
            invalid_credentials : "Registrando autentificación fallida para el email: %email% y password: %password%",
            no_email_or_pass : "Autentificación fallida por falta del parámetro <email> o <password>.",
        },
        error : {
            invalid_credentials : ">> El usuario o la contraseña especificados no existen en nuestra base de datos.",
            no_email : ">> Necesitas especificar un email. Comando: login -e email -p password. ",
            no_password : ">> Debes introducir una contraseña. Comando: login -e email -p password.",
        }
    },
    list : {

    },
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

        /* FindOne busca 1 valor en la base de datos */
        col.findOne({ email: email, password: password }).then(_user => {      
            if (!_user) print(lang.login.error.invalid_credentials, lang.login.log.login_error.replace("%email%", email).replace("%password%", password), true);  
            
            else {      
                _cb(null, _user._id.toHexString(), {         
                    id: _user._id.toHexString(), name: _user.name, surname: _user.surname,        
                    email: _user.email, nick: _user.nick });    
            }}).catch(err => {      
                _cb(err)    
            });  
    }).catch(err => {    
        cb(err);  
    }); 
}

function addUser(user, cb) {  
    if (!user.name) cb(new Error(lang.add.error.no_name));  
    else if (!user.surname) cb(new Error(lang.add.error.no_surname));  
    else if (!user.email) cb(new Error(lang.add.error.no_email));  
    else if (!user.nick) cb(new Error(lang.add.error.no_nick));  
    else if (!user.password) cb(new Error(lang.add.error.no_password));  
    else {    MongoClient.connect(url).then((client) => {      
        
        // create new callback for closing connection      
        _cb = function (err, res) {        
            client.close();        
            cb(err, res);      
        }

        let db = client.db('twitter_lite');      
        let users = db.collection('users');      
        users.findOne({ $or:[{ email: user.email },{ nick: user.nick }] }).then(        
            (_user) => {          
                if (_user) _cb(new Error('User already exists'));          
                else {            
                    user.following = [];            
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

function listUsers(token, opts, cb) {  
    MongoClient.connect(url).then(client => {    
        // create new callback for closing connection    
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        }    
        let db = client.db('twitter_lite');    
        let users = db.collection('users');    
        users.findOne({ _id: new mongodb.ObjectId(token) }).then(_user => {      
            if (!_user) _cb(new Error('Wrong token'));      
            else {        
                // adapt query        
                let _query = opts.query || {};        
                for (let key in _query) {          
                    if (Array.isArray(_query[key])) _query[key] = { $in: _query[key] };        
                }        
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

//addUser({name:'a', surname: 'b', email: 'c', password: 'd', nick:'e'},(err,res)=>console.log(err||res));
//login("c","d", (err,token, user) => console.log(err || token + ":" + JSON.stringify(user)));
//listUsers("b");

// Mensaje de LOG para los resultados correctos. >> Color azul y cursiva.
function logSuccess(message){
    console.log('\x1b[34m%s\x1b[0m','\x1b[3m[LOG] '+message+'\x1b[0m');
}

// Mensaje de LOG para los resultados erróneos. >> Color rojo y cursiva.
function logError(message){
    console.log('\x1b[31m%s\x1b[0m','\x1b[3m[LOG] '+message+'\x1b[0m');
}

function print(message, logMessage, isError){
    if(isError){
        console.log(message);
        logError(logMessage);
    }else{
        console.log(message);
        logSuccess(logMessage);
    }
}

module.exports = {
    addUser,    
    login,    
    listUsers 
}