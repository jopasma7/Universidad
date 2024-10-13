const MongoClient = require('mongodb').MongoClient;
const readline = require('readline');

// Crear la interfaz de readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lang = {
    welcome : '> Bienvenido al Programa. Por favor, ingresa tu nombre: ',
    answer : `> Hola, %username%! ¿Qué vamos a hacer hoy?`,
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
        remove : '(REMOVE) : Introduce el email del usuario que quieres eliminar.',
        exit : '(EXIT) : Saliendo del programa. Nos vemos pronto %username%.',
        main : 
`----------------------------------------------------
    >> Menú Principal:
----------------------------------------------------
    - ADD : Añadir un nuevo contacto.
    - LIST : Listar todos los contactos.
    - UPDATE : Actualizar algún contacto.
    - REMOVE : Eliminar un contacto.
    - EXIT : Salir del programa.
----------------------------------------------------`,
    },
    err : `Error: %error%`        
}



function logMessage(message){
    console.log('\x1b[3m'+message+'\x1b[0m');
}

// Main Menú ; Envía todos los comandos y acciones disponibles.
function menu(){
    rl.question(lang.cmd.main+"\n> Acción: ", (action) => {
        switch(action.toUpperCase()){
            case `ADD`:
                rl.question(lang.cmd.add.email, (email) => {
                    rl.question(lang.cmd.add.title, (title) => {                      
                        addContact(title, email,(err) => {
                            if(err) console.log(lang.err.replace("%error%",err.stack));
                            else console.log(lang.cmd.add.success);
                            logMessage(lang.log.contactAdded.replace("%email%",email).replace("%title%",title));
                            console.log(lang.return);
                            menu();
                        });           
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
                            addContact(oldEmail, email,title, (err) => {
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

// Inicio del programa. Manda un welcome mensaje y activa el menú de comandos.

var username = "";
rl.question(lang.welcome, (nombre) => {
    username = nombre;
    console.log(lang.answer.replace("%username%", username));     
    menu();
    
});

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
    
} 