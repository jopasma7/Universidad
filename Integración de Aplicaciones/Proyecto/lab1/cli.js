const readline = require("readline"); 
const minimist = require("minimist"); 
const model = require("./model_mongo"); 
const rl = readline.createInterface({    
    input: process.stdin,    
    output: process.stdout 
}); 

rl.setPrompt("TW Lite : "); 
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
            case "help": 
                help();
                cb();
            break;     
            case "exit":
                console.log("Bye");
                process.exit(0);
            break;
            case "login": 
                model.login(args.e, args.p, (err, _token, _user) => {
                    if(err) console.log(err);
                    else {
                        token = _token;
                        user = _user;
                        console.log("Welcome "+ _user.name);
                        rl.setPrompt(user.name + " : "); 
                        cb();
                    }
                })
            
            break;
            case "addUser": 
                let u = {
                    name: args.n,
                    surname: args.s,
                    email: args.e,
                    password: args.p,
                    nick: args.i,
                };
                model.addUser(u, (err, u) =>{
                    if(err) console.log(err);
                    else console.log("done.");
                    cb();
                })
            break;
            case "updateUser": 
            
            break;
            default: 
                help();
                cb();
        }    
    } 
}

function help (){
    console.log(`
Available commands: 
    - help : Ayuda
    - exit : Salir
    - addUser -n <name> -s <surname> -e <email> -p <password> -i <nick> : Añadir un usuario
    - login -e <email> -p <password> : Entrar al programa.
    - listUsers -q <query> -i <ini> -c <count> : Listar a los usuarios.
    - ...
    `);
}