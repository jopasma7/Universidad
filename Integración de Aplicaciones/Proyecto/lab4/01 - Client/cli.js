const readline = require("readline"); 
const minimist = require("minimist"); 
const messages = require("./messages"); 
const model_rest = require("./model_rest");
const model_mq = require("./model_mq");
const logger = require('./logger');

// Lista de comandos para autocompletar
const commands = ['exit', 'listUsers', 'login', 'addUser', 'updateUser', 'deleteUser', 'listFollowing', 'listFollowers', 
    'follow', 'unfollow', 'addTweet', 'addRetweet', 'listTweets', 'like', 'dislike'];

const rl = readline.createInterface({    
    input: process.stdin,    
    output: process.stdout,
    completer: (line) => {
        // Filtrar comandos que comienzan con el texto ingresado
        const hits = commands.filter((cmd) => cmd.startsWith(line));
        
        // Mostrar todas las opciones si no hay coincidencia exacta
        return [hits.length ? hits : commands, line];
      }
}); 

const http = require('http');
const options = {
  hostname: 'localhost', port: 8080,
  path: '/', method: 'GET'
};

const req = http.request(options, (res) => {
    res.on('end', () => {
        if (res.statusCode !== 401) {
            logger.info("\x1b[1m\x1b[34mEl servidor no está iniciado o hay algún error\x1b[0m.");
            process.exit(1); // Cierra el proceso Node.js
        }
    });
});

req.on('error', (e) => {
    logger.info(`\x1b[1m\x1b[34mProblema con la solicitud: El servidor no está iniciado o hay algún error\x1b[0m.`);
    process.exit(1); // Cierra el proceso Node.js con un código de error
});

req.end();


rl.setPrompt(messages.prompt); 
console.log(messages.login_menu);
rl.prompt(); 
rl.on("line", line => {   
    if(line){
        let args = minimist(fields = line.match(/'[^']*'|\S+/g));
        menu(args, () => {        
            rl.prompt();    
        }); 
    } else rl.prompt(); 
});

let token, user;

function menu(args, cb) {    
    if (!args._.length || args._[0] == "") cb();   
    else {         
        if(token !== undefined){  /* Lista de comandos que podremos ejecutar cuando el usuario esté logueado y tenga un Token */
            switch (args._[0]) { 
                case "updateUser": /* Comando: updateUser -n <nombre> -s <surname> -e <email> -p <password> -i <nick> */ 
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.update); cb(); break;  } 

                    // Validar que al menos un argumento sea proporcionado
                    if (!args.n && !args.s && !args.e && !args.p && !args.i) {
                        logger.info(print(messages.cmd.updateUser.no_param, 400));
                        cb();
                        break;
                    } 

                    /* Crea el usuario <newUserData> con lo valores proporcionados en el comando */
                    const newUserData = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i }; 
                   
                    model_mq.updateUser(token, newUserData, (err, res) =>{ /* Llama a la función updateUser() del Model */
                        if(err) logger.info(err.message);
                        else{
                            if(res.success) {
                                logger.info(print((messages.cmd.updateUser.success.replace("%nick%", res.user.nick)), 200));
                                if(res.user.nick != user.nick) rl.setPrompt("\x1b[1m\x1b[33m"+res.user.nick + "\x1b[0m : "); // Cambiamos el Prompt.
                                user = res.user; 
                            }else logger.info(res.message);
                            cb();
                        }                                    
                    })
                break;
                case "listUsers": /* Comando: listUsers -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listUsers); cb(); break;  } 

                    // Llama al método del Model para listar a los Usuarios.
                    model_rest.listUsers(token, args, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data && err.response.data.message) logger.info(err.response.data.message); // Aquí se imprime únicamente el mensaje de error del servidor   
                            else if (err.response.data) logger.info(err.response.data); // Esto maneja errores que no vienen del servidor 
                            else if (err.message) logger.info(err.message); // Más errores.
                            else logger.info("Error desconocido"); // Maneja cualquier otro tipo de error                   
                        }
                        else console.table(res);
                        cb();
                    })
                break;
                case "deleteUser": /* Comando: deleteUser --id <userID> */
                     /* Mostramos la ayuda del comando con el parámetro --help */
                     if(args.help != undefined){ console.log(messages.help.delete); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  
                        logger.info(print(messages.cmd.deleteUser.no_id, 400)); cb(); break;  
                    }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ logger.info(print(messages.cmd.deleteUser.no_length, 400)); cb(); break;   }

                    /* Tenemos los parámetros correctamente entonces le pasamos el método */
                    model_mq.deleteUser(token, args.id, (err,res) =>{
                        if(err) logger.info(err.message);
                        else {
                            if(res.success) {
                                if(token == res.id) {
                                    user = undefined; token = undefined;
                                    rl.setPrompt(messages.prompt); 
                                    console.log(messages.login_menu);
                                    logger.info(print(messages.cmd.deleteUser.success_own, 200));
                                }
                                else logger.info(print(messages.cmd.deleteUser.success.replace("%userID%", res.id), 200));
                            }else logger.info(res.message);
                        }
                        cb(); 
                    });
                break;
                case "follow": /* Comando: follow -id <userID> */
                     /* Mostramos la ayuda del comando con el parámetro --help */
                     if(args.help != undefined){ console.log(messages.help.follows); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  logger.info(print(messages.cmd.follow.no_id, 400));  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ logger.info(print(messages.cmd.follow.no_length, 400)); cb(); break;   }

                    /* Tenemos los parámetros correctamente entonces le pasamos el método */
                    model_mq.follow(token, args.id, (err,follow) =>{
                        if(err) logger.info(err.message);
                        else {
                            if(follow.success) {
                                logger.info(print(messages.cmd.follow.success.replace("%nick%",follow.following.nick), 200));
                            }else logger.info(follow.message);
                        }
                        cb(); 
                    });
                break;
                case "unfollow": /* Comando: unfollow -id <userID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.follows); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  logger.info(print(messages.cmd.unfollow.no_id, 400));  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ logger.info(print(messages.cmd.unfollow.no_length, 400)); cb(); break;   }

                    /* Tenemos los parámetros correctamente entonces le pasamos el método */
                    model_mq.unfollow(token, args.id, (err, unfollow) =>{
                        if(err) logger.info(err.message);
                        else {
                            if(unfollow.success) {
                                logger.info(print(messages.cmd.unfollow.success.replace("%nick%",unfollow.unfollowing.nick), 200));
                            }else logger.info(unfollow.message);
                        }
                        cb(); 
                    });
                break;
                case "listFollowing": /* Comando: listFollowing -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listFollowing); cb(); break;  } 

                    // Llama al método del Model para listar a los Followings.
                    model_rest.listFollowing(token, args, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data && err.response.data.message) logger.info(err.response.data.message); // Aquí se imprime únicamente el mensaje de error del servidor   
                            else if (err.response.data) logger.info(err.response.data); // Esto maneja errores que no vienen del servidor 
                            else if (err.message) logger.info(err.message); // Más errores.
                            else logger.info("Error desconocido"); // Maneja cualquier otro tipo de error                   
                        }
                        else console.table(res);
                        cb();
                    })
                break;
                case "listFollowers": /* Comando: listFollowers -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listFollowers); cb(); break;  } 

                    // Llama al método del Model para listar a los Followers.
                    model_rest.listFollowers(token, args, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data && err.response.data.message) logger.info(err.response.data.message); // Aquí se imprime únicamente el mensaje de error del servidor   
                            else if (err.response.data) logger.info(err.response.data); // Esto maneja errores que no vienen del servidor 
                            else if (err.message) logger.info(err.message); // Más errores.
                            else logger.info("Error desconocido"); // Maneja cualquier otro tipo de error                   
                        }
                        else console.table(res);
                        cb();
                    })  
                break;
                case "addTweet": /* Comando: addTweet -c <content> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.addTweet); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */

                    if(!args.c || (typeof args.c !== 'string' || args.c.trim() === '')){ logger.info(print(messages.cmd.addTweet.no_content, 400)); cb(); break; }

                    // Llama al método del Model para añadir el Tweet.
                    model_mq.addTweet(token, args.c, (err, res) => {
                        if(err) logger.info(err.message);
                        else {
                            if(res.success) {
                                logger.info(print(messages.cmd.addTweet.success, 201));
                            }else logger.info(res.message);
                        }
                        cb();
                    })  
                break;
                case "addRetweet": /* Comando: addRetweet --id <tweetID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.addRetweet); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  logger.info(print(messages.cmd.addRetweet.no_id, 400));  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ logger.info(print(messages.cmd.addRetweet.no_length, 400)); cb(); break;   }
                    // Llama al método del Model.
                    model_mq.addRetweet(token, args.id, (err, tw) => {
                        if(err) logger.info(err.message);
                        else {
                            if(tw.success) {
                                logger.info(print(messages.cmd.addRetweet.success.replace("%nick%",tw.owner), 200));
                            }else logger.info(tw.message);
                        }
                        cb();
                    })  
                break;
                case "listTweets": /* Comando: listTweets -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listTweets); cb(); break;  } 

                    // Llama al método del Model para listar los Tweets.
                    model_rest.listTweets(token, args, (err, res) => {
                        if(err) {
                            if (err.response && err.response.data && err.response.data.message) logger.info(err.response.data.message); // Aquí se imprime únicamente el mensaje de error del servidor   
                            else if (err.response.data) logger.info(err.response.data); // Esto maneja errores que no vienen del servidor 
                            else if (err.message) logger.info(err.message); // Más errores.
                            else logger.info("Error desconocido"); // Maneja cualquier otro tipo de error                   
                        }
                        else console.table(res);
                        cb();
                    })  
                break;
                case "like": /* Comando: like --id <tweetID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.like); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  logger.info(print(messages.cmd.like.no_id, 400));  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ logger.info(print(messages.cmd.like.no_length, 400)); cb(); break;   }
                    // Llama al método del Model.
                    model_mq.like(token, args.id, (err, like) => {
                        if(err) logger.info(err.message);
                        else {
                            if(like.success) {
                                logger.info(print(messages.cmd.like.success.replace("%nick%",like.tweet.owner.nick), 200));
                            }else logger.info(like.message);
                        }
                        cb();
                    })  
                break;
                case "dislike": /* Comando: dislike --id <tweetID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.dislike); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.id || (typeof args.id !== 'string' || args.id.trim() === '')){  logger.info(print(messages.cmd.dislike.no_id, 400));  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ logger.info(print(messages.cmd.dislike.no_length, 400)); cb(); break;   }
                    // Llama al método del Model.
                    model_mq.dislike(token, args.id, (err, dislike) => {
                        if(err) logger.info(err.message);
                        else {
                            if(dislike.success) {
                                logger.info(print(messages.cmd.dislike.success.replace("%nick%",dislike.tweet.owner.nick), 200));
                            }else logger.info(dislike.message);
                        } 
                        cb();                   
                    })  
                break;
                case "logout":
                    if(user) logger.info(messages.cmd.exit.logged.replace("%nick%",user.nick));
                    else logger.info(messages.cmd.exit.not_logged);
                    user = undefined; token = undefined;
                    rl.setPrompt(messages.prompt); 
                    console.log(messages.login_menu);
                    cb();
                    break; 
                default: /* Muestra el menú principal de ayuda */
                console.log(messages.menu);
                    cb();
            }
        
        }else{ /* Lista de comandos que podremos ejecutar sin Token. Menú de Login */
            if(rl.prompt != messages.prompt) rl.setPrompt(messages.prompt); 
            switch (args._[0]) {           
                case "login": /* Comando: login -e <email> -p <password> */                   
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.login); cb(); break;  }

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if (!args.e || (typeof args.e !== 'string' || args.e.trim() === '')){ logger.info(print(messages.cmd.login.no_email, 400));  cb(); break; }
                    else if(!args.p || (typeof args.p !== 'string' || args.p.trim() === '')){ logger.info(print(messages.cmd.login.no_password, 400)); cb(); break; }
     
                    model_rest.login(args.e, args.p, (err, _token, _user) => { /* Llama al método login del Model */
                        if (err) { 
                            if (err.response && err.response.data && err.response.data.message) logger.info(err.response.data.message); // Aquí se imprime únicamente el mensaje de error del servidor   
                            else if (err.response.data) logger.info(err.response.data); // Esto maneja errores que no vienen del servidor 
                            else if (err.message) logger.info(err.message); // Más errores.
                            else logger.info("Error desconocido"); // Maneja cualquier otro tipo de error 
                            cb(); 
                        }
                        else {
                            token = _token; user = _user;
                            logger.info(print((messages.cmd.login.success.replace("%nick%", _user.nick)), 200));
                            rl.setPrompt("\x1b[1m\x1b[33m"+user.nick + "\x1b[0m : "); 
                            console.log(messages.menu);
                            cb();
                        }
                    })

                break;
                case "addUser": /* Comando: addeUser -n <nombre> -s <surname> -e <email> -p <password> -i <nick> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.add); cb(); break;  }
                    
                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(!args.n || (typeof args.n !== 'string' || args.n.trim() === '')){ logger.info(print(messages.cmd.addUser.no_name, 400)); cb(); break; }
                    else if(!args.s || (typeof args.s !== 'string' || args.s.trim() === '')){ logger.info(print(messages.cmd.addUser.no_surname, 400)); cb(); break; }
                    else if(!args.e || (typeof args.e !== 'string' || args.e.trim() === '')){ logger.info(print(messages.cmd.addUser.no_email, 400)); cb(); break; }
                    else if(!args.p || (typeof args.p !== 'string' || args.p.trim() === '')){ logger.info(print(messages.cmd.addUser.no_password, 400)); cb(); break; }
                    else if(!args.i || (typeof args.i !== 'string' || args.i.trim() === '')){ logger.info(print(messages.cmd.addUser.no_nick, 400)); cb(); break; }
                    

                    /* Crea el usuario <u> con lo valores proporcionados en el comando */
                    let u = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i };
                    model_mq.addUser(u, (err, res) => { /* Llamada a la función addUser() del Model */
                        /* Comprobación de si el método addUser devuelve un usuario o errores */
                        if(err) logger.info(err.message);
                        else{
                            if(res.success) logger.info(print(messages.cmd.addUser.success , 201));
                            else logger.info(res.message);
                        }
                        cb();   
                    })
                break;
                case "exit":
                    logger.info(messages.cmd.exit.not_logged);
                    user = undefined; token = undefined;
                    process.exit(0);
                default: /* Muestra el menú de ayuda de login */
                console.log(messages.login_menu);
                    cb();
            }
        }
            
    } 
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
  
    return newMSG;
  }

module.exports = { print };

