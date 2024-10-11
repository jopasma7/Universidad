const sqlite3 = require('sqlite3');
const dbPath = "./contacts.db";

const lang = {
    log : {
        displayHelp : `LOG >> Mostrando el menú de comandos o ayuda.`,
        contactAdded : `LOG >> Se ha añadido un nuevo usuario a la base de datos. Email: %email%, Title: %title%`,
        execFunct : `LOG >> Ejecutando la función %funcion%`,
    },
    cmd : {
        addContact : `Has agregado un nuevo contacto.`,
        help : `
        Usage: node contacts <cmd>
        Available commands:
            - add <email> <title>
            - ls <query>?
            - update <email> <title>
            - rm <email>`,
    },
    err : `Error: %error%`        
}

init(); // Inicializa la base de datos.

if (process.argv.length <= 2) help();
else {
   let cmd = process.argv[2].toLowerCase();
   switch(cmd){
    case `add`:
        addContact(process.argv[4], process.argv[3],(err) => {
            if(err) console.log(lang.err.replace("%error%",err.stack));
            else console.log(lang.added);
        });
        break;
    case `ls`:
        listContacts(process.argv[3], (err, contacts) => {
            if(err) console.log(lang.err.replace("%error%",err.stack));
            else console.log(contacts);
        });
        break;
    case `update`:
        updateContacts();
        break;
    case `rm`:
        removeContacts();
        break;
    default:
        help();
   }
}

function help() {
    console.log(lang.log.displayHelp);
    console.log(lang.cmd.help);
}

/* Función para recoger todos los usuarios de la base de datos */
function listContacts(query, cb){
    console.log(lang.log.execFunct.replace(`%funcion%`, `listContacts()`));
    let db = new sqlite3.Database(dbPath);
    let sql = `SELECT * FROM contacts`;
    db.all(sql, (err,contacts) =>{
        if(err) cb(err);
        else cb(null, contacts);
        db.close();
    });
}

/* Función para recoger los contactos y añadirlos a la base de datos */
function addContact(title, email, cb){
    console.log(`LOG >> Entrando a la función addContacts(${title}, ${email})`);
    
    let db = new sqlite3.Database(dbPath);
    let sql = `INSERT INTO contacts VALUES ('${email}','${title}')`;

    db.run(sql, (err) => {
        if(err) cb(err);
        else cb();
        db.close();
    });
}

/* Inicializa la base de datos */
/* Crea la base de datos si no existe y si existe salta error */
function init(){
    let db = new sqlite3.Database(dbPath);
    db.run("CREATE TABLE contacts(email VARCHAR(32), title VARCHAR(32))", (err) =>{
        if (err) console.log("Database already exists");
        else console.log("Database created.");
        db.close();
    });

}

exports.writeContacts = writeContacts;
exports.readContacts = readContacts;