const readline = require("readline"); 
const minimist = require("minimist"); 
const model = require("./model_mongo"); 
const messages = require("./messages"); 
const rl = readline.createInterface({    
    input: process.stdin,    
    output: process.stdout 
}); 

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

                    /* Crea el usuario <u> con lo valores proporcionados en el comando */
                    let u = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i }; 
                   
                    model.updateUser(token, u, (err, u) =>{ /* Llama a la función updateUser() del Model */
                        if(u != undefined) {
                            if(user.nick != u.nick) rl.setPrompt(u.nick + " : "); // Cambiamos el Prompt.
                            user = u; // Reajustamos el usuario.
                        }                     
                        cb();                  
                    })
                break;
                case "follow": /* Comando: follow -id <userID> */
                     /* Mostramos la ayuda del comando con el parámetro --help */
                     if(args.help != undefined){ console.log(messages.help.follows); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(args.id == undefined){  print(messages.cmd.follow.no_id, 0);  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ print(messages.cmd.follow.no_length, 0); cb(); break;   }

                    /* Tenemos los parámetros correctamente entonces le pasamos el método */
                    model.follow(token, args.id, (err) =>{
                        if(err) console.log(err.stack);
                        cb(); 
                    });
                break;
                case "unfollow": /* Comando: unfollow -id <userID> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.follows); cb(); break;  } 

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(args.id == undefined){  print(messages.cmd.unfollow.no_id, 0);  cb(); break;  }
                    /* Comprobar también si el ID introducido tiene 24 números */
                    if(args.id.length !== 24){ print(messages.cmd.unfollow.no_length, 0); cb(); break;   }

                    /* Tenemos los parámetros correctamente entonces le pasamos el método */
                    model.unfollow(token, args.id, (err) =>{
                        if(err) console.log(err.stack);
                        cb(); 
                    });
                break;
                case "listUsers": /* Comando: listUsers -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listUsers); cb(); break;  } 

                    // Llama al método del Model para listar a los Usuarios.
                    model.listUsers(token, args, (err, res) => {
                        if(err) console.log(err);
                        else if(res == undefined) cb();
                        else { console.table(res); cb(); }
                    })
                break;
                case "listFollowing": /* Comando: listFollowing -q <query> -i <init> -c <count> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.listFollowing); cb(); break;  } 

                    // Llama al método del Model para listar a los Usuarios.
                    model.listFollowing(token, args, (err, res) => {
                        if(err) console.log(err);
                        else if(res == undefined) cb();
                        else { console.table(res); cb(); }
                    })
                break;
                case "exit":
                    if(user) console.log(messages.cmd.exit.logged.replace("%nick%",user.nick));
                    else console.log(messages.cmd.exit.not_logged);
                    user = undefined; token = undefined;
                    process.exit(0);   
                default: /* Muestra el menú principal de ayuda */
                    console.log(messages.menu);
                    cb();
            }
        
        }else{ /* Lista de comandos que podremos ejecutar sin Token. Menú de Login */
            switch (args._[0]) {           
                case "login": /* Comando: login -e <email> -p <password> */                   
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.login); cb(); break;  }

                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(args.e == undefined){ print(messages.cmd.login.no_email, 0);  cb(); break; }
                    else if(args.p == undefined){ print(messages.cmd.login.no_password, 0); cb(); break; }
     
                    model.login(args.e, args.p, (err, _token, _user) => { /* Llama al método login del Model */
                        if(err) console.log(err);
                        else if(_token == undefined) cb();
                        else {
                            token = _token; user = _user;
                            printWithLog((messages.cmd.login.success.replace("%nick%", _user.nick)), 
                                (messages.log.user_join.replace("%nick%", _user.nick)
                                .replace("%email%", _user.email)), 1);
                            rl.setPrompt("\x1b[1m\x1b[33m"+user.nick + "\x1b[0m : "); 
                            cb();
                        }
                    })

                break;    
                case "exit":
                    console.log(messages.cmd.exit.not_logged);
                    user = undefined; token = undefined;
                    process.exit(0);
                case "addUser": /* Comando: addeUser -n <nombre> -s <surname> -e <email> -p <password> -i <nick> */
                    /* Mostramos la ayuda del comando con el parámetro --help */
                    if(args.help != undefined){ console.log(messages.help.add); cb(); break;  }
                    
                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if((args.n == undefined) || !args.n){ print(messages.cmd.addUser.no_name, 0); cb(); break; }
                    else if((args.s == undefined) || !args.s){ print(messages.cmd.addUser.no_surname, 0); cb(); break; }
                    else if((args.e == undefined) || !args.e){ print(messages.cmd.addUser.no_email, 0); cb(); break; }
                    else if((args.p == undefined) || !args.p){ print(messages.cmd.addUser.no_password, 0); cb(); break; }
                    else if((args.i == undefined) || !args.i){ print(messages.cmd.addUser.no_nick, 0); cb(); break; }
    
                    /* Crea el usuario <u> con lo valores proporcionados en el comando */
                    let u = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i };
      
                    model.addUser(u, (err, u) =>{ /* Llamada a la función addUser() del Model */
                        /* Comprobación de si el método addUser devuelve un usuario undefined */
                        /* En caso de devolverlo es porque ya existe el usuario en la base de datos y devuelve error */
                        if(u != undefined) {
                            if(err) console.log(err);
                            else {
                                printWithLog(messages.cmd.addUser.success, (messages.log.new_user
                                    .replace("%name%", args.n).replace("%surname%", args.s)
                                    .replace("%email%", args.e).replace("%password%", args.p)
                                    .replace("%nick%", args.i)),1);
                            }
                        }
                        cb();   
                    })
                break;
                default: /* Muestra el menú de ayuda de login */
                    console.log(messages.login_menu);
                    cb();
            }
        }
            
    } 
}

function printWithLog(message, logMessage, color){
    print(message, color);
    console.log('\x1b[90m%s\x1b[0m','[LOG] \x1b[3m'+logMessage+'\x1b[0m');
}

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