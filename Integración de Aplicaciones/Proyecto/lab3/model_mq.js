const zmq = require("zeromq");
/*======================================================*/
/*                 USUARIOS >> ADDUSER                  */
/*======================================================*/
/*  Esta función sirve para agregar nuevos usuarios a   */
/*          la base de datos de la aplicación           */
/*                  Requiere un <user>                  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*       Si logró o falló la creación del usuario       */

function addUser(user, cb) {  
    // Comprobación de los parámetros. Si falta alguno imprime error en cliente y servidor (Log)
    if (!user.name) cb(printErr(messages.cmd.addUser.no_name, 0));
    else if (!user.surname) cb(printErr(messages.cmd.addUser.no_surname, 0));
    else if (!user.email) cb(printErr(messages.cmd.addUser.no_email, 0));
    else if (!user.nick) cb(printErr(messages.cmd.addUser.no_nick, 0));
    else if (!user.password) cb(printErr(messages.cmd.addUser.no_password, 0));
    else {
        // Crear socket que conecte con el servidor (Push)
    const sock = new zmq.Push();

    (async () => {
        try {
            await sock.connect('tcp://127.0.0.1:9090');

            const msg = {
                type: "addUser",
                data: user,
            };

            await sock.send(JSON.stringify(msg));
            console.log('Message sent successfully');
            cb(null, { success: true });
        } catch (err) {
            console.error('Error while sending message:', err.stack);
            cb(err);
        } finally {
            sock.close(); // Cerrar el socket para liberar recursos
        }
    })();
    }
}

module.exports = {
    addUser,    
}