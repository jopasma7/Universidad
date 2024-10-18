const readline = require("readline"); 
const minimist = require("minimist"); 
const model = require("./model_mongo"); 
const messages = require("./messages"); 
const rl = readline.createInterface({    
    input: process.stdin,    
    output: process.stdout 
}); 

rl.setPrompt("TW Lite : "); 
console.log(messages.menu);
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
        switch (args._[0]) {           
            case "login": 
                // Comprobación de los parámetros. Revisa si existen y no son undefined.
                if(args.e == undefined){
                    print(messages.login.no_email,messages.login.log.no_email_or_pass, 0);
                    cb(); break;
                }else if(args.p == undefined){
                    print(messages.login.no_password,messages.login.log.no_email_or_pass, 0);
                    cb(); break;
                }

                // Llama al método login del Model.
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
                        rl.setPrompt(user.name + " : "); 
                        cb();
                    }
                })
                
            
            break;
            case "help": 
                console.log(messages.menu);
                cb();
            break;     
            case "exit":
                console.log("Bye");
                process.exit(0);
            break;
            
            // Comando para Agregar un usuario a la base de datos. 
            case "addUser": 
                // Comprobación de los parámetros. Revisa si existen y no son undefined.
                if((args.n == undefined) || !args.n){
                    print(messages.add.no_name, messages.add.log.no_param, 0);
                    cb(); break;                  
                }else if((args.s == undefined) || !args.s){
                    print(messages.add.no_surname, messages.add.log.no_param, 0);
                    cb(); break;
                }else if((args.e == undefined) || !args.e){
                    print(messages.add.no_email, messages.add.log.no_param, 0);
                    cb(); break;
                }else if((args.p == undefined) || !args.p){
                    print(messages.add.no_password, messages.add.log.no_param, 0);
                    cb(); break;
                }else if((args.i == undefined) || !args.i){
                    print(messages.add.no_nick, messages.add.log.no_param, 0);
                    cb(); break;
                }

                // Crea el usuario <u> con lo valores proporcionados en el comando.
                let u = { name: args.n, surname: args.s, email: args.e, password: args.p, nick: args.i };

                // Llama a la función addUser() del Model.
                model.addUser(u, (err, u) =>{
                    if(err) console.log(err);
                    cb();
                })

            break;
            case "updateUser": 
            
            break;
            default: 
                console.log(messages.menu);
                cb();
        }    
    } 
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