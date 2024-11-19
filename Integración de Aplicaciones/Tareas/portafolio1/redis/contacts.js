const redis = require('redis');
const readline = require('readline');

// Crear la interfaz de readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lang = {
    welcome : '> Bienvenido al Programa. Por favor, ingresa tu nombre: ',
    answer : `> Hola, %user%! ¿Qué vamos a hacer hoy?`,
    invalid_action : "\n> Acción no válida. Revisa las posibles opciones.\n",
    log : {
        contactAdded : `[LOG] >> Se ha registrado la acción para crear un nuevo usuario a la base de datos. Email: %email%, Title: %title%`,
        contactList : `[LOG] >> Se ha registrado la acción para listar los contactos de la base de datos. Con una query: [%query%].`,
        contactRemove : `[LOG] >> Se ha registrado la acción para eliminar al usuario [%email%] de la base de datos.`,
        execFunct : `[LOG] >> Ejecutando la función %funcion%`,
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
        main : `> Menú Principal:
    - ADD : Añadir un nuevo contacto.
    - LIST : Listar todos los contactos.
    - UPDATE : Actualizar algún contacto existente.
    - REMOVE : Eliminar un contacto.`,
    },
    err : `Error: %error%`        
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
                        });
                        console.log(lang.log.contactAdded.replace("%email%",email).replace("%title%",title));
                        rl.close(); 
                    });
                }); 
                               
                break;
            case `LIST`:
                rl.question(lang.cmd.list.query, (query) => {
                    listContacts(query, (err, contacts) => {
                        if(err) console.log(lang.err.replace("%error%",err.stack));
                        else console.log(contacts);
                    });
                    console.log(lang.log.contactList.replace("%query%",query));
                    rl.close(); 
                }); 
                 
                break;
            case `UPDATE`:
                rl.question("(UPDATE) : Email del usuario que deseas modificar: ", (oldEmail) => {
                    rl.question("(UPDATE) : Nuevo Email: ", (email) => {
                        rl.question("(UPDATE) : Nuevo Title: ", (title) => {
                            addContact(oldEmail, email,title, (err) => {
                                if(err) console.log(lang.err.replace("%error%",err.stack));
                                else console.log(lang.cmd.add.success);
                            });
                        }); 
                    }); 
                }); 
               
                
                break;
            case `REMOVE`:
                rl.question(lang.cmd.remove, (email) => {
                    removeContact(email, (err) => {
                        if(err) console.log(lang.err.replace("%error%",err.stack));
                        
                    }); 
                    console.log(lang.log.contactRemove.replace("%email%",email));
                    rl.close(); 
                }); 
                
                
                break;
            default:
                console.log(lang.invalid_action);
                menu();
        }
        
    }); 
} 

// Inicio del programa. Manda un welcome mensaje y activa el menú de comandos.
rl.question(lang.welcome, (nombre) => {
    console.log(lang.answer.replace("%user%", nombre));   
    menu();   
});

/* Función para recoger todos los usuarios de la base de datos */
function listContacts(query, cb){
    console.log(lang.log.execFunct.replace(`%funcion%`, `listContacts()`));
    let client = redis.createClient();
    client.connect().then(res =>{
        client.keys("/contacts/*").then(keys =>{
            let promises =[]; 
            for(let key of keys){
                let promise = client.get(key);
                promises.push(promise);
            } 
            Promise.all(promises).then(res =>{
                let contacts =[];
                for (let r of res){
                    let contact = JSON.parse(r);
                    contacts.push(contact);
                }  
                cb(null, contacts);
            }).catch(err =>{
                cb(err);
                
            }).finally(() =>{
                client.disconnect();
            });
        } ).catch(err =>{
            cb(err);
            client.disconnect();
        });
    }).catch(err => cb(err))
    
}

/* Función para eliminar a un contacto */
function removeContact(email, cb){
    console.log(lang.log.execFunct.replace(`%funcion%`, `removeContact()`));
    let client = redis.createClient();
    client.connect().then(res =>{
        client.del(`/contacts/${email}`).then(res =>{
            cb();
            client.disconnect();
        }).catch(err =>{
            client.disconnect();
        })
    }).catch(err => cb(err));
} 

/* Función para recoger los contactos y añadirlos a la base de datos */
function addContact(title, email, cb){
    console.log(lang.log.execFunct.replace(`%funcion%`, `addContact()`));
    
    let client = redis.createClient();
    client.connect().then(res =>{
        let contact ={
            title: title,
            email: email,
        } ;
        let json = JSON.stringify(contact);
        client.set(`/contacts/${email}`, json).then(res =>{
            cb();
            client.disconnect();
        }).catch(err =>{
            client.disconnect();
        })
    }).catch(err => cb(err));
}

function updateContact(oldEmail, email, title, cb){
    console.log(lang.log.execFunct.replace(`%funcion%`, `updateContact()`));
    removeContact(oldEmail, (err) => {
        if(err) console.log(lang.err.replace("%error%",err.stack));
        
    });
    let client = redis.createClient();
    client.connect().then(res =>{
        let contact ={
            title: title,
            email: email,
        } ;
        let json = JSON.stringify(contact);
        client.set(`/contacts/${email}`, json).then(res =>{
            cb();
            client.disconnect();
        }).catch(err =>{
            client.disconnect();
        })
    }).catch(err => cb(err));
} 