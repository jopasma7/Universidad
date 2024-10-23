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
    let args = minimist(fields = line.split(" "));    
    menu(args, () => {        
        rl.prompt();    
    }); 
}); 

let token, user;

function menu(args, cb) {    
    if (!args._.length || args._[0] == "") cb();   
    else {   
        /* Lista de comandos que podremos ejecutar cuando el usuario esté logueado y tenga un Token */
        if(token !== undefined){
            switch (args._[0]) { 
                case "updateUser":
                    /* Comando: updateUser -n <nombre> -s <surname> -e <email> -p <password> -i <nick> */  
                    /* Crea el usuario <u> con lo valores proporcionados en el comando */
                    let u = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i };
    
                    /* Llama a la función updateUser() del Model */
                    model.updateUser(token, u, (err, u) =>{
                        if(u != undefined) {
                            if(user.nick != u.nick) rl.setPrompt(u.nick + " : "); // Cambiamos el Prompt.
                            user = u; // Reajustamos el usuario.
                        }                     
                        cb();
                        
                    })
                break;
                case "listUsers": 
                    /* Comando: listUsers -q <query> -i <init> -c <count> */
                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    /* Puede no tener parámetros... */
                    /* .
                    * .
                    * .
                    */

                    // Llama al método del Model para listar a los Usuarios.
                    model.listUsers(token, args, (err, res) => {
                        if(err) console.log(err);
                        else if(res == undefined) cb();
                        else {  
                            console.table(res);                     
                            cb();
                        }
                    })
                break;   
                default: 
                    /* Muestra el menú principal de ayuda */
                    console.log(messages.menu);
                    cb();
            }
        /* Lista de comandos que podremos ejecutar sin Token. Menú de Login */
        }else{
            switch (args._[0]) {           
                case "login": 
                    /* Comando: login -e <email> -p <password> */
                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if(args.e == undefined){
                        print(messages.login.no_email,messages.login.log.no_email_or_pass, 0);
                        cb(); break;
                    }else if(args.p == undefined){
                        print(messages.login.no_password,messages.login.log.no_email_or_pass, 0);
                        cb(); break;
                    }
    
                    /* Llama al método login del Model */
                    model.login(args.e, args.p, (err, _token, _user) => {
                        if(err) console.log(err);
                        else if(_token == undefined){
                            cb();
                        }else {
                            token = _token;
                            user = _user;
                            print((messages.login.welcome.replace("%user%", _user.name)), 
                                (messages.login.log.user_join.replace("%user%", _user.name)
                                .replace("%email%", _user.email)), 1);
                            rl.setPrompt(user.nick + " : "); 
                            cb();
                        }
                    })
                    
                
                break;    
                case "exit":
                    console.log("Bye");
                    process.exit(0);
                break;
                
                
                case "addUser": 
                    /* Agregar un usuario a la base de datos */ 
                    /* Comando: addUser -n <nombre> -s <surname> -e <email> -p <password> -i <nick> */
                    /* Comprobación de los parámetros. Revisa si existen y no son undefined */
                    if((args.n == undefined) || !args.n){
                        print(messages.modify.no_name, messages.modify.log.cancel_add_no_param, 0);
                        cb(); break;                  
                    }else if((args.s == undefined) || !args.s){
                        print(messages.modify.no_surname, messages.modify.log.cancel_add_no_param, 0);
                        cb(); break;
                    }else if((args.e == undefined) || !args.e){
                        print(messages.modify.no_email, messages.modify.log.cancel_add_no_param, 0);
                        cb(); break;
                    }else if((args.p == undefined) || !args.p){
                        print(messages.modify.no_password, messages.modify.log.cancel_add_no_param, 0);
                        cb(); break;
                    }else if((args.i == undefined) || !args.i){
                        print(messages.modify.no_nick, messages.modify.log.cancel_add_no_param, 0);
                        cb(); break;
                    }
    
                    /* Crea el usuario <u> con lo valores proporcionados en el comando */
                    let u = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i };
    
                    /* Llama a la función addUser() del Model */
                    model.addUser(u, (err, u) =>{
                        /* Comprobación de si el método addUser devuelve un usuario undefined */
                        /* En caso de devolverlo es porque ya existe el usuario en la base de datos y devuelve error */
                        if(u == undefined) {
                            cb();
                        }else{
                            if(err) {
                                console.log(err);
                            }else {
                                print(messages.modify.user_registered, (messages.modify.log.user_added.replace("%email%", args.e)
                                .replace("%nick%", args.i)),1);
                            }
                            cb();
                        }
    
                        
                    })
    
                break;
                default: 
                    /* Muestra el menú de ayuda de login */
                    console.log(messages.login_menu);
                    cb();
            }
        }
            
    } 
}


/* Mensaje de info para los mensajes informativos. >> Color azul */
function info(message){
    console.log('\x1b[34m[Info]\x1b[0m ' + message);
}

/* Mensaje de éxitos para los resultados correctos. >> Color verde */
function success(message){
    console.log('\x1b[32m[Éxito]\x1b[0m ' + message);
}

/* Mensaje de error para los resultados erróneos. >> Color rojo */
function error(message){
    //console.log('\x1b[31m%s\x1b[0m',message);
    console.log('\x1b[31m[Error]\x1b[0m ' + message);
}

/* Mensaje de LOG para los resultados erróneos. >> Color gris y cursiva */
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