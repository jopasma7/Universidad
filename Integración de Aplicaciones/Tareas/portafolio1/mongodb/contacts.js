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
    answer : colors.bold + colors.cyan + `🎉 ¡Bienvenido al programa de Contactos basado en MongoDB! ¿Cómo te llamas? : ` + colors.reset,
    welcome : `\n📚 ¿Qué tal ${colors.yellow}${colors.bold}%name%${colors.reset}? ¡Vamos a ponernos al día! 📚\n` + colors.reset + 
    `⏳ Serás redirigido al menú principal en: ${colors.yellow}${colors.bold}%seconds%${colors.reset} segundos...` + colors.reset,
    countdown_high : `⏰ Quedan ${colors.yellow}${colors.bold}%seconds%${colors.reset} segundos...`,
    countdown_low : `⏳ ¡Ya casi! Solo quedan ${colors.red}${colors.bold}%seconds%${colors.reset} segundos...`,
    redirect : colors.yellow + colors.bold + `\n🚀 Redirigiendo al menú principal...\n` + colors.reset,

    log : {
        add_contact : `Se ha registrado la acción para crear un nuevo usuario a la base de datos. Email: %email%, Title: %title%`,
        list_contact : `Se ha registrado la acción para listar los contactos de la base de datos. Con query: [%query%].`,
        delete_contact : `Se ha registrado la acción para eliminar al usuario [%email%] de la base de datos.`,
        update_contact : `Se ha registrado la acción para eliminar al usuario [%email%] de la base de datos.`,
        exit : `Cerrando el programa...`,
    },
    cmd : {
        add : {
            no_email : `Debes especificar el parámetro -e <email>. Recuerda el comando: ${colors.yellow}add -e <email> -t <title>${colors.reset}`,
            no_title : "Debes especificar el parámetro -t <title>",
            already_exists : `Ya existe el email <%email%> registrado en nuestra base de datos`,
            success : `Has agregado un nuevo contacto a la base de datos.`,
        },
        list : {
            empty : "La lista de contactos especificada está vacía.",
            parse_err : `Error al parsear. Utiliza algo similar a esto: ${colors.yellow}list -q '{ email : "nuevoEmail" }'${colors.reset}`,
            success : "Imprimiendo lista de contactos..."
        },
        delete : {
            no_email : `Debes especificar el parámetro -e <email>. Recuerda el comando: ${colors.yellow}remove -e <email>${colors.reset}`,
            not_found : `El email <%email%> no está registrado en nuestras bases de datos.`,
            faul : 'Parece que algo ha fallado y no se ha podido eliminar al usuario.',
            success : "Contacto eliminado de la base de datos."
        },
        update : {
            no_params : `No has especificado ningún parámetro para cambiar.`,
            no_data : 'No has introducido valores para actualizar tus datos.',
            success : "Has actualizado tus datos de contacto."
        },
        exit : colors.yellow + 'Saliendo del programa. Nos vemos pronto %name%.' + colors.reset,
        
    },
    main_menu : figlet.textSync('Menú Principal', { horizontalLayout: 'full' }) + colors.reset +
        '\n\n' +
        colors.green + '    === Comandos Disponibles ===' + colors.reset + '\n' +
        '\n' +
        colors.yellow + '    [1] ADD <email> <title>        : ' + colors.white + 'Añadir un nuevo contacto.' + colors.reset + '\n' +
        colors.yellow + '    [2] LIST [query]               : ' + colors.white + 'Listar todos los contactos.' + colors.reset + '\n' +
        colors.yellow + '    [3] UPDATE [email] [title]     : ' + colors.white + 'Actualizar algún contacto.' + colors.reset + '\n' +
        colors.yellow + '    [4] DELETE <email>             : ' + colors.white + 'Eliminar un contacto.' + colors.reset + '\n' +
        colors.yellow + '    [5] EXIT                       : ' + colors.white + 'Salir del programa.' + colors.reset + '\n',       
}


// Inicia el programa y manda un Titulo de Contactos y una mensaje. Luego inicia Countdown.
console.log(figlet.textSync('Contactos', { font: 'Big', horizontalLayout: 'full' }));
rl.question(lang.answer, (res) => {
    name = res;
    countdown(5);
});

// Llama a uno función que hace una cuenta atrás y luego imprime el menú de comandos.
function countdown(seconds) {
    print((lang.welcome.replace("%seconds%",seconds).replace("%name%",name)), 0);
    
    const interval = setInterval(() => {
        seconds--;
        if (seconds > 3) print((lang.countdown_high.replace("%seconds%",seconds)), 0);
        else if (seconds <= 3 && seconds > 0) print((lang.countdown_low.replace("%seconds%",seconds)), 0);
        else {
            print(lang.redirect, 0); clearInterval(interval); // Detener el intervalo
            rl.setPrompt(lang.prompt);  print(lang.main_menu, 0); rl.prompt(); 
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
                if(!args.e || (typeof args.e !== 'string' || args.e.trim() === '')) { print(lang.cmd.add.no_email, 5); cb(); return; }
                if(!args.t || (typeof args.t !== 'string' || args.t.trim() === '')) { print(lang.cmd.add.no_title, 5); cb(); return; }

                addContact(args.t, args.e,(err) => {
                    if(err) print((err.message), 5);
                    else {
                        print(lang.cmd.add.success, 2);
                        logger(lang.log.add_contact.replace("%email%",args.e).replace("%title%",args.t));
                    }
                    cb();
                });

            break;
            case "list":
                let query = {};
                if(args.q) query = args.q;
                listContacts(query, (err, contacts) => {
                    if(err) print((err.message), 5);
                    else {
                        if(contacts.length == 0) { print(lang.cmd.list.empty, 1); cb(); return; }
                        else console.table(contacts);
                        print(lang.cmd.list.success, 2);  
                        logger(lang.log.list_contact.replace("%query%", query));
                    }
                    cb();
                
                });  
            break;
            case "update":
                const contact = {};

                if (args.e && typeof args.e === 'string' && args.e.trim() !== '') {
                    contact.email = args.e; // Asignar solo si args.e es válido
                }

                if (args.t && typeof args.t === 'string' && args.t.trim() !== '') {
                    contact.title = args.t; // Asignar solo si args.t es válido
                }
                updateContact(contact, (err, result) => {
                    if(err) print((err.message), 5);
                    else {
                        print(lang.cmd.update.success, 2);
                        logger(lang.log.update_contact);
                    }
                    cb();
                });

            break;
            case "delete":
                if(!args.e || (typeof args.e !== 'string' || args.e.trim() === '')) { print(lang.cmd.delete.no_email, 5); cb(); return; }
                deleteContact(args.e, (err, result) => {
                    if(err) print((err.message), 5);
                    else {
                        print(lang.cmd.delete.success, 2);
                        logger(lang.log.delete_contact.replace("%email%",args.e));
                    }
                    cb();
                });

            break;
            case "exit":
                print((lang.cmd.exit.replace("%name%",name)),0);
                name = undefined;
                process.exit(0);
            default:
                console.log(lang.main_menu);
                cb();
        }
    }
}

/* Función para recoger los contactos y añadirlos a la base de datos */
function addContact(title, email, cb) {
    const client = new MongoClient('mongodb://localhost:27017');
    client.connect((err, client) => {
        if (err) return cb(err);

        let db = client.db("ej4");
        let col = db.collection("contacts");

        // Verificar si el correo electrónico ya existe
        col.findOne({ email: email }, (err, existingContact) => {
            if (err) {
                client.close();
                return cb(err);
            }

            // Si ya existe un contacto con el mismo correo, se retorna un error
            if (existingContact) {
                client.close();
                return cb(new Error(lang.cmd.add.already_exists.replace("%email%", email)));
            }

            // Si no existe, insertar el nuevo contacto
            col.insertOne({ title: title, email: email }, (err) => {
                if (err) {
                    client.close();
                    return cb(err);
                }
                cb(); // Contacto insertado correctamente
                client.close();
            });
        });
    });
}

// Función para listar los contactos en MongoDB según la consulta
function listContacts(query, cb) {
    const client = new MongoClient('mongodb://localhost:27017');
    client.connect((err, client) => {
        if (err) return cb(err);

        let db = client.db("ej4");
        let col = db.collection("contacts");

        let jsonQuery = {}; /* Variable para almacenar la query */
        if(query && typeof query === 'string' && query.trim() !== ''){
            const qu = query.replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a la clave.
            .replace(/^'+|'+$/g, '') // Quita las comillas de fuera.
            .replace(/'/g, '"');// Cambiar comillas simples por comillas dobles.
                     
            try { jsonQuery = JSON.parse(qu); } // Parseamos para convertirlo en un JSON.
            catch(err){ return cb(new Error(lang.cmd.list.parse_err)); } // Mensaje de inválid format JSON.              
        }  

        let _query = jsonQuery;

        col.find(_query).toArray((err, contacts) => {
            if (err) {
                client.close();
                return cb(err);
            }

            cb(null, contacts);
            client.close();
        });
    });
}

function updateContact(contact, cb) {
    const client = new MongoClient('mongodb://localhost:27017');
    client.connect((err, client) => {
        if (err) return cb(err);

        let db = client.db("ej4");
        let col = db.collection("contacts");

        // Filtrar las propiedades que no sean undefined
        const updateFields = Object.fromEntries(
            Object.entries(contact).filter(([key, value]) => value !== undefined)
        );

        if (Object.keys(updateFields).length > 0) {
            col.updateOne({ email: contact.email }, { $set: updateFields }, (err, result) => {
                if (err) return cb(err);
                cb(null, result);  // Llamamos al callback con el resultado
                client.close();
            });
        } else {
            cb(new Error(lang.cmd.update.no_data));
            client.close();
        }
    });
}

// Función para eliminar un contacto por su email
function deleteContact(email, cb) {
    const client = new MongoClient('mongodb://localhost:27017');
    client.connect((err, client) => {
        if (err) return cb(err);

        let db = client.db("ej4");
        let col = db.collection("contacts");

        // Buscar si existe un contacto con ese correo electrónico
        col.findOne({ email: email }, (err, existingContact) => {
            if (err) {
                client.close();
                return cb(err);
            }

            // Si no existe el contacto, retornar un error
            if (!existingContact) {
                client.close();
                return cb(new Error(lang.cmd.delete.not_found.replace("%email%", email)));
            }

            // Si existe, eliminar el contacto
            col.deleteOne({ email: email }, (err, result) => {
                if (err) {
                    client.close();
                    return cb(err);
                }

                if (result.deletedCount === 0) {
                    client.close();
                    return cb(new Error(lang.cmd.delete.fail)); // Si no se eliminó el contacto
                }

                // Si el contacto fue eliminado correctamente
                cb(null, lang.cmd.delete.success.replace("%email%", email));
                client.close();
            });
        });
    });
}

function print(message, type){
    switch(type){
        case 0: console.log(message); break;
        case 1: console.log(colors.cyan + "[Info] " + colors.gray + ">> "+ colors.white + message + colors.reset); break;
        case 2: console.log(colors.green + "[Éxito] " + colors.gray + ">> "+ colors.white + message + colors.reset); break;
        case 5: console.log(colors.red + "[Error] " + colors.gray + ">> "+ colors.white + message + colors.reset);  break;
    }
}

function logger(message){
    console.log('\x1b[3m'+ colors.gray + "[LOG] >> " + message+'\x1b[0m');
}