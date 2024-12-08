const MongoClient = require('mongodb').MongoClient;
const readline = require("readline"); 
const minimist = require("minimist"); 
const figlet = require('figlet');

// Lista de comandos para autocompletar
const commands = ['exit', 'add', 'update', 'delete', 'login', 'register', 'list'];

const path = 'mongodb://localhost:27017';
const dbName = "ejercicio4";
const colName = "contacts";

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

let user = {
    name : "",
    email : "",
    contacts : []
};

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
    welcome2 : `\nHola, %name%. Antes de empezar a organizar los contactos debes ${colors.yellow}Registrarte ${colors.reset}/ ${colors.yellow}Iniciar Sesión.${colors.reset}`,
    countdown_high : `⏰ Quedan ${colors.yellow}${colors.bold}%seconds%${colors.reset} segundos...`,
    countdown_low : `⏳ ¡Ya casi! Solo quedan ${colors.red}${colors.bold}%seconds%${colors.reset} segundos...`,
    redirect : colors.yellow + colors.bold + `\n🚀 Redirigiendo al menú principal...\n` + colors.reset,

    log : {
        new_register : `Se ha registrado en la base de datos un nuevo usuario con Email: %email%`,
        new_login : `Acaba de acceder a la aplicación un usuario con Email: %email%`,
        add_contact : `El usuario %name% ha agregado un nuevo contacto a su lista. Email: %email%, Title: %title%`,
        list_contact : `Se ha registrado la acción para listar los contactos de %name%.`,
        delete_contact : `El usuario %name% ha efectuado una eliminación de uno de sus contactos: [%email%].`,
        update_contact : `El usuario %name% ha actualizado uno de sus contactos con email: [%email%].`,
        exit : `Cerrando el programa...`,
    },
    cmd : {
        register : {
            no_email : `Debes especificar el parámetro -e <email>. Recuerda el comando: ${colors.yellow}register -e <email> -p <password>${colors.reset}`,
            no_pass : `Debes especificar el parámetro -p <password>. Recuerda el comando: ${colors.yellow}register -e <email> -p <password>${colors.reset}`,
            success : `Te has registrado correctamente en la aplicación de Contactos con email : <%email%>.`,
            already_exists : `Ya existe un usuario con ese email: %email% registrado en nuestras bases de datos.`,
        },
        login : {
            no_email : `Debes especificar el parámetro -e <email>. Recuerda el comando: ${colors.yellow}login -e <email> -p <password>${colors.reset}`,
            no_pass : `Debes especificar el parámetro -p <password>. Recuerda el comando: ${colors.yellow}login -e <email> -p <password>${colors.reset}`,
            invalid_email : `El email especificado no está registrado en nuestra aplicación.`,
            invalid_pass : `La contraseña especificada es incorrecta.`,
            success : `Inicio de Sesión exitoso.`,
        },
        add : {
            no_email : `Debes especificar el parámetro -e <email>. Recuerda el comando: ${colors.yellow}add -e <email> -t <title>${colors.reset}`,
            no_title : "Debes especificar el parámetro -t <title>",
            already_exists : `Ya existe el email <%email%> registrado en tus contactos.`,
            same_email : `No puedes agregar tu email %email% a la lista de tus contactos.`,
            error : "No se encontró el usuario o no se pudo añadir el contacto.",
            success : `Has agregado un nuevo contacto a tu lista de contactos.`,
        },
        list : {
            empty : "Tu lista de contactos especificada está vacía.",
            parse_err : `Error al parsear. Utiliza algo similar a esto: ${colors.yellow}list -q '{ email : "nuevoEmail" }'${colors.reset}`,
            success : "Imprimiendo tu lista de contactos..."
        },
        delete : {
            no_email : `Debes especificar el parámetro ${colors.yellow}-e <email>${colors.reset}. Recuerda el comando: ${colors.yellow}delete -e <email>${colors.reset}`,
            not_found : `El email <%email%> no existe en tus contactos.`,
            faul : 'Parece que algo ha fallado y no se ha podido eliminar al usuario.',
            success : "Contacto eliminado de tu lista de contactos."
        },
        update : {
            no_params : `No has especificado ningún parámetro para cambiar. ${colors.yellow}update -c <contactoEmail> -e <newEmail> -t <newTitle>${colors.reset}`,
            no_contact : `Especifica el email del contacto que quieres modificar con ${colors.yellow}-c <contactoEmail>${colors.reset}`,
            not_found : `No se encontró el contacto: %email% en tus contactos.`,
            same_email : 'No puedes poner tu email en uso: %email% a alguno de tus contactos.',
            success : "Has actualizado los datos del contacto %email%."
        },
        exit : colors.yellow + 'Saliendo del programa. Nos vemos pronto %name%.' + colors.reset,
        
    },
    start_menu : `      \n${colors.green}${colors.bold}=== Comandos Disponibles ===${colors.reset}
    
- ${colors.yellow}${colors.bold}REGISTER${colors.reset} -e <email> -p <password>    :   ${colors.white} Registrarse en la aplicación de contactos.${colors.reset}
- ${colors.yellow}${colors.bold}LOGIN${colors.reset} -e <email> -p <password>       :   ${colors.white} Iniciar sesión para empezar a gestionar los contactos.${colors.reset}
    `,
    main_menu : figlet.textSync('Menú Principal', { horizontalLayout: 'full' }) + colors.reset +
        '\n\n' +
        `Los parámetros entre ${colors.yellow}<...>${colors.white} son obligatorios y los ${colors.yellow}[...]${colors.white} opcionales.${colors.reset}\n\n` +
        colors.green + colors.bold + '    === Comandos Disponibles ===' + colors.reset + '\n' +
        '\n' +
        colors.yellow + '[1] ADD -e <email> -t <title>                          : ' + colors.white + 'Añadir un nuevo contacto.' + colors.reset + '\n' +
        colors.yellow + '[2] LIST -q [query]                                    : ' + colors.white + 'Listar todos tus contactos.' + colors.reset + '\n' +
        colors.yellow + '[3] UPDATE -c <contacto> -e [newEmail] -t [newTitle]   : ' + colors.white + 'Actualizar alguno de tus contactos.' + colors.reset + '\n' +
        colors.yellow + '[4] DELETE -e <email>                                  : ' + colors.white + 'Eliminar algún contacto.' + colors.reset + '\n' +
        colors.yellow + '[5] EXIT                                               : ' + colors.white + 'Salir del programa.' + colors.reset + '\n',       
}


// Inicia el programa y manda un Titulo de Contactos y una mensaje. Luego inicia Countdown.
console.log(figlet.textSync('Contactos', { font: 'Big', horizontalLayout: 'full' }));
rl.question(lang.answer, (res) => {
    user.name = res;
    print(lang.welcome2.replace("%name%", user.name),0);
    print((lang.start_menu) ,0);
    rl.setPrompt(lang.prompt); rl.prompt(); 
            rl.on("line", line => {   
                if(line){
                    let args = minimist(fields = line.match(/'[^']*'|\S+/g));
                    menu(args, () => {        
                        rl.prompt();    
                    }); 
                } else rl.prompt(); 
            });
});


function menu(args, cb) {    
    if (!args._.length || args._[0] == "") cb();   
    else {         
        switch ((args._[0]).toLowerCase()) { 
            case "register":
                if(!args.e || (typeof args.e !== 'string' || args.e.trim() === '')) { print(lang.cmd.register.no_email, 5); cb(); return; }
                if(!args.p || (typeof args.p !== 'string' || args.p.trim() === '')) { print(lang.cmd.register.no_pass, 5); cb(); return; }

                register(args.e, args.p,(err) => {
                    if(err) print((err.message), 5);
                    else {
                        print(lang.cmd.register.success.replace("%email%",args.e), 2);
                        logger(lang.log.new_register.replace("%email%",args.e));
                    }
                    cb();
                });

            break;
            case "login":
                if(!args.e || (typeof args.e !== 'string' || args.e.trim() === '')) { print(lang.cmd.login.no_email, 5); cb(); return; }
                if(!args.p || (typeof args.p !== 'string' || args.p.trim() === '')) { print(lang.cmd.login.no_pass, 5); cb(); return; }

                login(args.e, args.p,(err) => {
                    if(err) { print((err.message), 5); cb() }
                    else {
                        print(lang.cmd.login.success, 2);
                        logger(lang.log.new_login.replace("%email%",args.e));
                        user.email = args.e;
                        let seconds = 5;
                        print((lang.welcome.replace("%seconds%",seconds).replace("%name%",user.name)), 0);
                    
                        const interval = setInterval(() => {
                            seconds--;
                            if (seconds > 3) print((lang.countdown_high.replace("%seconds%",seconds)), 0);
                            else if (seconds <= 3 && seconds > 0) print((lang.countdown_low.replace("%seconds%",seconds)), 0);
                            else {
                                print(lang.redirect, 0); clearInterval(interval); // Detener el intervalo
                                print(lang.main_menu, 0);
                                cb();
                        }
                        }, 1000); // Ejecutar cada 1000 ms (1 segundo)
                    }
                });

            break;           
            case "add":
                if(!args.e || (typeof args.e !== 'string' || args.e.trim() === '')) { print(lang.cmd.add.no_email, 5); cb(); return; }
                if(!args.t || (typeof args.t !== 'string' || args.t.trim() === '')) { print(lang.cmd.add.no_title, 5); cb(); return; }

                addContact(args.t, args.e,(err) => {
                    if(err) print((err.message), 5);
                    else {
                        print(lang.cmd.add.success, 2);
                        logger(lang.log.add_contact.replace("%name%",user.name).replace("%email%",args.e).replace("%title%",args.t));
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
                        logger(lang.log.list_contact.replace("%name%",user.name));
                    }
                    cb();
                
                });  
            break;
            case "update":
                let values = {};

                if(!args.c || (typeof args.c !== 'string' || args.c.trim() === '')) { print(lang.cmd.update.no_contact, 5); cb(); return; }
                if (args.e && typeof args.e === 'string' && args.e.trim() !== '') values.nuevoEmail = args.e;
                if (args.t && typeof args.t === 'string' && args.t.trim() !== '') values.nuevoTitle = args.t;
                if(values == {}) { print(lang.cmd.update.no_params, 5); cb(); return; }
                updateContact(args.c, values, (err) => {
                    if(err) print((err.message), 5);
                    else {
                        print(lang.cmd.update.success.replace("%email%",args.c), 2);
                        logger(lang.log.update_contact.replace("%name%", user.name).replace("%email%",args.c));
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
                        logger(lang.log.delete_contact.replace("%name%",user.name).replace("%email%",args.e));
                    }
                    cb();
                });

            break;
            case "exit":
                print((lang.cmd.exit.replace("%name%",user.name)),0);
                user.name = undefined;
                process.exit(0);
            default:
                if(user.email != "") console.log(lang.main_menu);
                else console.log(lang.start_menu);
                cb();   
        }
    }
}

// Registrar a un usuario con email y password.
function register(email, password, cb){
    // Revisar si me pasaron el parámetro Email y Pass!
    if(!email) return cb(new Error(lang.cmd.register.no_email));
    if(!password) return cb(new Error(lang.cmd.register.no_pass));
    MongoClient.connect(path).then(client => {  
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        } 

        let db = client.db(dbName);
        let col = db.collection(colName);

       
        // Revisar si ya existe un usuario con ese email!!
        col.findOne({ email: email }, (err, exist) => {
            if (err) return _cb(err);
            
            // Si ya existe un usuario con el mismo correo, se retorna un error
            if (exist) return _cb(new Error(lang.cmd.register.already_exists.replace("%email%", email)));         

            // Si no existe, insertar el nuevo contacto
            col.insertOne({ email : email, password : password, contacts : [] }, (err) => {
                if (err) return _cb(err);
                _cb(); // Contacto insertado correctamente
            });
        });
    });
}

function login(email, password, cb){
    // Revisar si me pasaron el parámetro Email y Pass!
    if(!email) return cb(new Error(lang.cmd.login.no_email));
    if(!password) return cb(new Error(lang.cmd.login.no_pass));
    MongoClient.connect(path).then(client => {  
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        } 

        let db = client.db(dbName);
        let col = db.collection(colName);

       
        // Revisar si ya existe un usuario con ese email y password!!
        col.findOne({ email : email }, (err, exist) => {
            if (err) return _cb(err);
            
            // Si no existe un usuario con ese correo, se retorna un error
            if (!exist) return _cb(new Error(lang.cmd.login.invalid_email));
            // Si el usuario no tiene la misma password, devuelve error.
            if(exist.password != password) return _cb(new Error(lang.cmd.login.invalid_pass));
            user.contacts = exist.contacts; // Ponemos en memoria los contactos.
            _cb(); // Login
        });
    });
}

/* Función para recoger los contactos y añadirlos a la base de datos */
function addContact(title, email, cb) {
    // Revisar si me pasaron el parámetro Email y Title!
    if(!title) return cb(new Error(lang.cmd.add.no_title));
    if(!email) return cb(new Error(lang.cmd.add.no_email));
    MongoClient.connect(path).then(client => {  
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        } 

        let db = client.db(dbName);
        let col = db.collection(colName);

        // Comprueba que no se agregue a si mismo a los contactos...
        if(user.email === email) return _cb(new Error(lang.cmd.add.same_email.replace("%email%", email)));  

        // Verificar si ya tiene ese contacto agregado...
        if(user.contacts.some(contact => contact.email === email)) return _cb(new Error(lang.cmd.add.already_exists.replace("%email%", email)));
        else{
            col.updateOne({ email: user.email }, { $push: { contacts: {title : title, email : email} } }).then(result => {
                if(result.modifiedCount > 0){ 
                    user.contacts.push({title : title, email : email}); // Memoria
                    _cb(null);
                }
                else _cb(new Error(lang.cmd.add.error));
                
            }).catch(error => {
                _cb(error);
            })
        }    
    })
}

// Función para listar los contactos en MongoDB según la consulta
function listContacts(query, cb) {
    let jsonQuery = {};

    if (query && typeof query === 'string' && query.trim() !== '') {
        const qu = query
            .replace(/(\w+)\s*:/g, '"$1":') // Añadir comillas a las claves.
            .replace(/^'+|'+$/g, '') // Quitar las comillas externas.
            .replace(/'/g, '"'); // Cambiar comillas simples por dobles.

        try {
            jsonQuery = JSON.parse(qu); // Parsear la consulta como JSON.
        } catch (err) {
            return cb(new Error(lang.cmd.list.parse_err), null); // Devolver error a través del callback.
        }
    }

    try {
        // Filtrar contactos que coincidan con la consulta.
        const filteredContacts = user.contacts.filter(contact => {
            return Object.keys(jsonQuery).every(key => contact[key] === jsonQuery[key]);
        });
        cb(null, filteredContacts); // Devolver los resultados a través del callback.
    } catch (err) {
        cb(err, null); // Devolver error en caso de fallo.
    }
}

function updateContact(email, values, cb) {
    MongoClient.connect(path).then(client => {
        const { nuevoEmail, nuevoTitle } = values;
        const _cb = function (err, res) {
            client.close();
            cb(err, res);
        };
        const db = client.db(dbName);
        const col = db.collection(colName);

        if (!nuevoEmail && !nuevoTitle) return _cb(new Error(lang.cmd.update.no_params));
        const contact = user.contacts.find(contact => contact.email === email); //Memoria
        if (!contact) return _cb(new Error(lang.cmd.update.not_found.replace("%email%", email)));

        if (nuevoEmail) contact.email = nuevoEmail;
        if (nuevoTitle) contact.title = nuevoTitle;

        // Crear el objeto de actualización dinámico
        const updateFields = {};
        if (nuevoEmail) updateFields["contacts.$[contact].email"] = nuevoEmail;
        if (nuevoTitle) updateFields["contacts.$[contact].title"] = nuevoTitle;

        // Ejecutar la actualización
        col.updateOne({ email: user.email, "contacts.email": email }, { $set: updateFields }, { arrayFilters: [{ "contact.email": email }]},
            (err, res) => {
                if (err) return _cb(err);
                _cb(null, res); // Devolver el resultado de la actualización
            }
        );
    }).catch(err => cb(err));
}

// Función para eliminar un contacto por su email
function deleteContact(email, cb) {
    // Revisar si me pasaron el parámetro Email y Title!
    if(!email) return cb(new Error(lang.cmd.delete.no_email));
    MongoClient.connect(path).then(client => {  
        _cb = function (err, res) {      
            client.close();      
            cb(err, res);    
        } 

        let db = client.db(dbName);
        let col = db.collection(colName); 

        // Verificar si existe ese contacto agregado...
        if(!user.contacts.some(contact => contact.email === email)) return _cb(new Error(lang.cmd.delete.not_found.replace("%email%", email)));
        col.updateOne({ email: user.email },
            { $pull: { contacts: { email: email } } }, (err, result) => {
            if (err) return _cb(err);

            if (result.modifiedCount === 0) {
                return _cb(new Error(lang.cmd.delete.fail)); 
            }

            // Si el contacto fue eliminado correctamente
            _cb(null, lang.cmd.delete.success.replace("%email%", email));
            user.contacts = user.contacts.filter(contact => contact.email !== email);
        });   
    })
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