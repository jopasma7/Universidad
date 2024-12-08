const redis = require('redis');
const readline = require("readline"); 
const minimist = require("minimist"); 
const figlet = require('figlet');

// Lista de comandos para autocompletar
const commands = ['exit', 'add', 'update', 'delete', 'login', 'register', 'list'];
const URL = 'redis://127.0.0.1:6379';
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

const client = redis.createClient(URL);
    client.connect().then(() => {
        client.disconnect;

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
    }).catch((err) => {
        if (err) {
            print("No se puede conectar a la base de datos de Redis en la dirección: "+URL, 5)
            process.exit(0);
        }
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
                        let seconds = 0;
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

// Registrar a un usuario con email y password en Redis.
function register(email, password, cb) {
    if (!email) return cb(new Error(lang.cmd.register.no_email));
    if (!password) return cb(new Error(lang.cmd.register.no_pass));

    const client = redis.createClient(URL);

    client.connect().then(() => {
        const _cb = (err, res) => {
            client.quit().then(() => {
                cb(err, res);
            }).catch((quitErr) => {
                console.error(quitErr);
                cb(err || quitErr, res);
            });
        };

        const userKey = `user:${email}`;

        // Verificar si el usuario ya existe
        client.exists(userKey).then(exists => {
            if (exists) return _cb(new Error(lang.cmd.register.already_exists.replace("%email%", email)));

            // Registrar nuevo usuario
            client.hSet(userKey, { email: email, password: password, }).then(() => {
                _cb(null, `Usuario ${email} registrado correctamente.`);
            }).catch(err => _cb(err));
        }).catch(err => _cb(err));
    }).catch(connectErr => {
        if(connectErr) cb(new Error("No hay conexión a la base de datos de Redis."))
    });
}

function login(email, password, cb) {
    if (!email) return cb(new Error(lang.cmd.login.no_email));
    if (!password) return cb(new Error(lang.cmd.login.no_pass));

    const client = redis.createClient(URL);

    client.connect().then(() => {
        const _cb = (err, res) => {
            client.disconnect();
            cb(err, res);
        };

        // Comprobar si existe el usuario en Redis
        const userKey = `user:${email}`;
        const contactsKey = `contacts:${email}`;

        client.exists(userKey).then(exists => {
            if (!exists) return _cb(new Error(lang.cmd.login.invalid_email));

            // Obtener los datos del usuario
            client.hGetAll(userKey).then(userData => {
                if (!userData) return _cb(new Error(lang.cmd.login.invalid_email));

                // Verificar la contraseña
                if (userData.password !== password) {
                    return _cb(new Error(lang.cmd.login.invalid_pass));
                }

                client.lRange(contactsKey, 0, -1)
                    .then(contacts => {
                        user.contacts = contacts.map(contact => JSON.parse(contact)); // Si los elementos están serializados en JSON
                        console.log(user.contacts);
                        _cb(null, `Usuario ${email} autenticado con éxito.`);
                    }).catch(err => _cb(new Error(err.message)));       
            }).catch(err => _cb(new Error(err.message)));
        }).catch(err => _cb(new Error(err.message)));
    }).catch(err => {
        if(err) cb(new Error("No hay conexión a la base de datos de Redis."))
    });
}


/* Función para recoger los contactos y añadirlos a la base de datos */
function addContact(title, email, cb) {
    // Revisar si me pasaron el parámetro Email y Title
    if (!title) return cb(new Error(lang.cmd.add.no_title));
    if (!email) return cb(new Error(lang.cmd.add.no_email));

    const client = redis.createClient(URL);

    client.connect().then(() => {
        const _cb = (err, res) => {
            client.disconnect();
            cb(err, res);
        };

        const userKey = `user:${user.email}`;
        const contactKey = `contacts:${user.email}`;

        // Comprueba que no se agregue a sí mismo a los contactos
        if (user.email === email) {
            return _cb(new Error(lang.cmd.add.same_email.replace("%email%", email)));
        }

        // Verificar si ya tiene ese contacto agregado
        client.lRange(contactKey, 0, -1).then(contacts => {
            const parsedContacts = contacts.map(contact => JSON.parse(contact));

            if (parsedContacts.some(contact => contact.email === email)) {
                return _cb(new Error(lang.cmd.add.already_exists.replace("%email%", email)));
            }

            // Agregar el nuevo contacto
            const newContact = { title, email };
            client.rPush(contactKey, JSON.stringify(newContact)).then(() => {
                user.contacts.push(newContact); // Actualizar en memoria
                _cb(null, `Contacto ${email} añadido correctamente.`);
            }).catch(err => _cb(err));
        }).catch(err => _cb(err));
    }).catch(err => {
        console.error('Error al conectar con Redis:', err.message);
        cb(new Error("No hay conexión a la base de datos de Redis."));
    });
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

function updateContact(contactEmail, values, cb) {
    if (!contactEmail) return cb(new Error(lang.cmd.update.no_email));
    if (!values) return cb(new Error(lang.cmd.update.no_params));

    const { nuevoTitle: newTitle, nuevoEmail: newEmail } = values;
    if(!values.nuevoTitle && !values.nuevoEmail) return cb(new Error(lang.cmd.update.no_params));

    const client = redis.createClient(URL);
    client.connect().then(() => {
        const _cb = (err, res) => {
            client.disconnect();
            cb(err, res);
        };

        const userKey = `user:${user.email}`;
        const contactKey = `contacts:${user.email}`;

        // Obtener los contactos del usuario
        client.lRange(contactKey, 0, -1).then(contacts => {
            const parsedContacts = contacts.map(contact => JSON.parse(contact));

            // Buscar el contacto a actualizar
            const contactIndex = parsedContacts.findIndex(contact => contact.email === contactEmail);
            if (contactIndex === -1) {
                return _cb(new Error(lang.cmd.update.not_found.replace("%email%", contactEmail)));
            }

            // Actualizar el contacto con los nuevos valores
            if (newEmail) parsedContacts[contactIndex].email = newEmail;
            if (newTitle) parsedContacts[contactIndex].title = newTitle;

            // Actualizar también en memoria (user.contacts)
            const contactInMemoryIndex = user.contacts.findIndex(contact => contact.email === contactEmail);
            if (contactInMemoryIndex !== -1) {
                if (newEmail) user.contacts[contactInMemoryIndex].email = newEmail;
                if (newTitle) user.contacts[contactInMemoryIndex].title = newTitle;
            }

            // Guardar el contacto actualizado en Redis
            client.del(contactKey).then(() => {
                const updatedContacts = parsedContacts.map(contact => JSON.stringify(contact));
                client.rPush(contactKey, ...updatedContacts).then(() => {
                    _cb(null, `Contacto ${contactEmail} actualizado correctamente.`);
                }).catch(err => _cb(err));
            }).catch(err => _cb(err));

        }).catch(err => _cb(new Error(err.message)));
    }).catch(err => {
        console.error('Error al conectar con Redis:', err.message);
        cb(new Error("No hay conexión a la base de datos de Redis."));
    });
}

// Función para eliminar un contacto por su email
function deleteContact(contactEmail, cb) {
    if (!contactEmail) return cb(new Error(lang.cmd.delete.no_email));

    const client = redis.createClient(URL);
    client.connect().then(() => {
        const _cb = (err, res) => {
            client.disconnect();
            cb(err, res);
        };

        const contactKey = `contacts:${user.email}`;

        // Obtener los contactos del usuario
        client.lRange(contactKey, 0, -1).then(contacts => {
            const parsedContacts = contacts.map(contact => JSON.parse(contact));

            // Buscar el contacto a eliminar
            const contactIndex = parsedContacts.findIndex(contact => contact.email === contactEmail);
            if (contactIndex === -1) {
                return _cb(new Error(lang.cmd.delete.not_found.replace("%email%", contactEmail)));
            }

            // Eliminar el contacto de la lista en memoria (user.contacts)
            const contactInMemoryIndex = user.contacts.findIndex(contact => contact.email === contactEmail);
            if (contactInMemoryIndex !== -1) {
                user.contacts.splice(contactInMemoryIndex, 1); // Eliminar de la memoria local
            }

            // Eliminar el contacto de Redis
            client.lRem(contactKey, 1, JSON.stringify(parsedContacts[contactIndex])).then(() => {
                _cb(null, `Contacto ${contactEmail} eliminado correctamente.`);
            }).catch(err => _cb(err));

        }).catch(err => _cb(new Error(err.message)));
    }).catch(err => {
        console.error('Error al conectar con Redis:', err.message);
        cb(new Error("No hay conexión a la base de datos de Redis."));
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