const MongoClient = require('mongodb').MongoClient;
const readline = require("readline"); 
const minimist = require("minimist"); 
const figlet = require('figlet');

// Lista de comandos para autocompletar
const commands = ['exit', 'listUsers', 'login', 'addUser', 'updateUser', 'listFollowing', 'listFollowers', 
    'follow', 'unfollow', 'addTweet', 'addRetweet', 'listTweets', 'like', 'dislike'];

const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  cursiva: '\x1b[3m',
  reset: '\x1b[0m'
};

let name = "";

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

const lang = {
    prompt : colors.green + colors.bold + "Contacts : " + colors.reset,
    answer : colors.bold + colors.cyan + `🎉 ¡Bienvenido al programa de Contactos! ¿Cómo te llamas? : ` + colors.reset,
    welcome : `\n📚 ¿Qué tal ${colors.yellow}${colors.bold}%name%${colors.reset}? ¡Vamos a ponernos al día! 📚\n` + colors.reset + 
    `⏳ Serás redirigido al menú principal en: ${colors.yellow}${colors.bold}%seconds%${colors.reset} segundos...` + colors.reset,
    countdown_high : `⏰ Quedan ${colors.yellow}${colors.bold}%seconds%${colors.reset} segundos...`,
    countdown_low : `⏳ ¡Ya casi! Solo quedan ${colors.red}${colors.bold}%seconds%${colors.reset} segundos...`,
    redirect : colors.yellow + colors.bold + `\n🚀 Redirigiendo al menú principal...\n` + colors.reset,
    
    
    
    invalid_action : "\n> Acción no válida. Revisa las posibles opciones.\n",
    return : "\nRegresando al menú principal de comandos...\n",
    log : {
        contactAdded : `[LOG] >> Se ha registrado la acción para crear un nuevo usuario a la base de datos. Email: %email%, Title: %title%`,
        contactList : `[LOG] >> Se ha registrado la acción para listar los contactos de la base de datos. Con una query: [%query%].`,
        contactRemove : `[LOG] >> Se ha registrado la acción para eliminar al usuario [%email%] de la base de datos.`,
        execFunct : `[LOG] >> Ejecutando la función %funcion%`,
        exit : `[LOG] >> Cerrando el programa...`,
    },
    cmd : {
        add : {
            email : "(ADD) : Introduzca el Email: ",
            title : "(ADD) :_Introduzca el Title: ",
            success : `(ADD) : Has agregado un nuevo contacto.`,
        },
        list : {
            query : "(LIST) : Introduzca una query (En blanco si no existe): ",
        },
        remove : '(REMOVE) : Introduce el email del usuario que quieres eliminar: ',
        exit : '(EXIT) : Saliendo del programa. Nos vemos pronto %username%.',
        
    },
    main_menu : figlet.textSync('Menú Principal', { horizontalLayout: 'full' }) + colors.reset +
        '\n\n' +
        colors.green + '    === Comandos Disponibles ===' + colors.reset + '\n' +
        '\n' +
        colors.yellow + '    [1] ADD <email> <title>        : ' + colors.white + 'Añadir un nuevo contacto.' + colors.reset + '\n' +
        colors.yellow + '    [2] LIST [query]               : ' + colors.white + 'Listar todos los contactos.' + colors.reset + '\n' +
        colors.yellow + '    [3] UPDATE <email> <values>    : ' + colors.white + 'Actualizar algún contacto.' + colors.reset + '\n' +
        colors.yellow + '    [4] REMOVE <email>             : ' + colors.white + 'Eliminar un contacto.' + colors.reset + '\n' +
        colors.yellow + '    [5] EXIT                       : ' + colors.white + 'Salir del programa.' + colors.reset + '\n',
    err : `Error: %error%`        
}


// Inicia el programa y manda un Titulo de Contactos y una mensaje. Luego inicia Countdown.
console.log(figlet.textSync('Contactos', { font: 'Big', horizontalLayout: 'full' }));
rl.question(lang.answer, (res) => {
    name = res;
    countdown(5);
});

// Llama a uno función que hace una cuenta atrás y luego imprime el menú de comandos.
function countdown(seconds) {
    console.log(lang.welcome.replace("%seconds%",seconds).replace("%name%",name));
    
    const interval = setInterval(() => {
        seconds--;
        if (seconds > 3) console.log(lang.countdown_high.replace("%seconds%",seconds));
        else if (seconds <= 3 && seconds > 0) console.log(lang.countdown_low.replace("%seconds%",seconds));
        else {
            console.log(lang.redirect); clearInterval(interval); // Detener el intervalo
            rl.setPrompt(lang.prompt);  console.log(lang.main_menu); rl.prompt(); 
            rl.on("line", line => {   
                if(line){
                    let args = minimist(fields = line.match(/'[^']*'|\S+/g));
                    menu(args, () => {        
                        rl.prompt();    
                    }); 
                } else rl.prompt(); 
            });
      }
    }, 1000); // Ejecutar cada 1000 ms (1 segundo)
}

function menu(args, cb) {    
    if (!args._.length || args._[0] == "") cb();   
    else {         
        switch ((args._[0]).toLowerCase()) { 
            case "add":
                if(!args.e) { console.log("Error: No email"); cb(); return; }
                if(!args.t) { console.log("Error: No email"); cb(); return; }
                console.log("add");

                addContact(args.t, args.e,(err) => {
                    if(err) console.log(lang.err.replace("%error%",err.message));
                    else console.log(lang.cmd.add.success);
                    logMessage(lang.log.contactAdded.replace("%email%",args.e).replace("%title%",args.t));
                });

                cb();
            break;
            case "list":
                console.log("list");
                let query = [];
                if(args.q) query = args.q
                listContacts(query, (err, contacts) => {
                    if(err) console.log(lang.err.replace("%error%",err.message));
                    else console.table(contacts);
                    logMessage(lang.log.contactList.replace("%query%",query));
                });  
            break;
            default:
                console.log(lang.main_menu);
                cb();
        }
    }
}


function logMessage(message){
    console.log('\x1b[3m'+message+'\x1b[0m');
}

// Main Menú ; Envía todos los comandos y acciones disponibles.
function menuu(){
    rl.question(lang.cmd.main+"\n> Acción: ", (action) => {
        switch(action.toUpperCase()){
            case `ADD`:
                rl.question(lang.cmd.add.email, (email) => {
                    rl.question(lang.cmd.add.title, (title) => {                      
                                   
                    });
                }); 
                               
                break;
            case `LIST`:
                rl.question(lang.cmd.list.query, (query) => {
                    listContacts(query, (err, contacts) => {
                        if(err) console.log(lang.err.replace("%error%",err.stack));
                        else console.log(contacts);
                        logMessage(lang.log.contactList.replace("%query%",query));
                        console.log(lang.return);
                        menu();
                    });                         
                }); 
            
                break;
            case `UPDATE`:
                rl.question("(UPDATE) : Email del usuario que deseas modificar: ", (oldEmail) => {
                    rl.question("(UPDATE) : Nuevo Email: ", (email) => {
                        rl.question("(UPDATE) : Nuevo Title: ", (title) => {
                            updateContact(oldEmail, email, title, (err) => {
                                if(err) console.log(lang.err.replace("%error%",err.stack));
                                else console.log(lang.cmd.add.success);
                                console.log(lang.return);
                                menu();
                            });
                        }); 
                    }); 
                }); 

                break;
            case `REMOVE`:
                rl.question(lang.cmd.remove, (email) => {
                    removeContact(email, (err) => {
                        if(err) console.log(lang.err.replace("%error%",err.stack));
                        logMessage(lang.log.contactRemove.replace("%email%",email));
                        console.log(lang.return);
                        menu();
                    });                  
                }); 
                           
                break;
            case `EXIT`:
                rl.close();  
                console.log(lang.cmd.exit.replace("%username%", username));  
                logMessage(lang.log.exit);                 
                break;
            default:
                console.log(lang.invalid_action);
                menu();
        }
        
    }); 
} 


/* Función para recoger todos los usuarios de la base de datos */
function listContacts(query, cb){
    logMessage(lang.log.execFunct.replace(`%funcion%`, `listContacts()`));
    const client = new MongoClient('mongodb://localhost:27017');
    // const client = new MongoClient('mongodb://0.0.0.0:27017');
    client.connect((err, client) => {
        if(err) cb(err);
        else{
            //client.db("ej4").collection("contacts").insertOne();
            let db = client.db("ej4");
            let col = db.collection("contacts");
            col.find({}).toArray((err, contacts) => {
                if(err) cb(err);
                else cb(null, contacts);
                client.close();
            });
        }
    });
}

/* Función para eliminar a un contacto */
function removeContact(email, cb){
    logMessage(lang.log.execFunct.replace(`%funcion%`, `removeContact()`));
    const client = new MongoClient('mongodb://localhost:27017');
    client.connect((err, client) => {
        if(err) cb(err);
        else{
            let db = client.db("ej4");
            let col = db.collection("contacts");
            col.deleteOne({email: email}, (err, res) => {
                if(err) cb(err);
                else cb();
                client.close();
            });
        }
    });

} 

/* Función para recoger los contactos y añadirlos a la base de datos */
function addContact(title, email, cb){
    logMessage(lang.log.execFunct.replace(`%funcion%`, `addContact()`));
    const client = new MongoClient('mongodb://localhost:27017');
    client.connect((err, client) => {
        if(err) cb(err);
        else{
            //client.db("ej4").collection("contacts").insertOne();
            let db = client.db("ej4");
            let col = db.collection("contacts");
            col.insertOne({title:title, email:email}, (err, res) => {
                if(err) cb(err);
                else cb();
                client.close();
            });
        }
    });
    
}

function updateContact(oldEmail, email, title, cb){
    logMessage(lang.log.execFunct.replace(`%funcion%`, `updateContact()`));
    const client = new MongoClient('mongodb://localhost:27017');
    client.connect((err, client) => {
        if(err) cb(err);
        else{
            //client.db("ej4").collection("contacts").insertOne();
            let db = client.db("ej4");
            let col = db.collection("contacts");
            /*

            Revisar comportamiento erroneo.

            */
            col.updateOne({ email : oldEmail },{ $set: { title : title , email : email } }, (err, res) => {
                if(err) cb(err);
                else cb();
                client.close();
            });
        }
    });
} 