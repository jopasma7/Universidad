const zmq = require("zeromq");

const URL_USERS = 'tcp://127.0.0.1:9090';
const URL_TWEETS = 'tcp://127.0.0.1:9095';
/*======================================================*/
/*                 USUARIOS >> ADDUSER                  */
/*======================================================*/
/*  Esta función sirve para agregar nuevos usuarios a   */
/*          la base de datos de la aplicación           */
/*                  Requiere un <user>                  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*       Si logró o falló la creación del usuario       */

async function addUser(user, cb) {  
    // Comprobación de los parámetros. Si falta alguno imprime error en cliente y servidor (Log)
    if (!user.name) cb(printErr(messages.cmd.addUser.no_name, 0));
    else if (!user.surname) cb(printErr(messages.cmd.addUser.no_surname, 0));
    else if (!user.email) cb(printErr(messages.cmd.addUser.no_email, 0));
    else if (!user.nick) cb(printErr(messages.cmd.addUser.no_nick, 0));
    else if (!user.password) cb(printErr(messages.cmd.addUser.no_password, 0));
    else {
        
        const sock = new zmq.Dealer();
        sock.connect(URL_USERS);
  
        const msg = { type: "addUser", data: user };
  
        try {
            await sock.send(JSON.stringify(msg));
            const [reply] = await sock.receive();
            const response = JSON.parse(reply.toString());
            cb(null, response);
        } 
        catch (err) { cb(err); } 
        finally { sock.close(); }
    }
}


/*======================================================*/
/*               USUARIOS >> UPDATEUSER                 */
/*======================================================*/
/*   Esta función sirve para cambiar los datos de un    */
/*       un usuario. Almacenado en la Aplicación        */
/*                 Requiere un <token>                  */
/* Requiere especificar el usuario que queremos cambiar */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */
async function updateUser(token, newUserData, cb) {
    const sock = new zmq.Dealer();
    sock.connect(URL_USERS);
  
    const msg = {
      type: "updateUser",
      token: token,
      data: newUserData,
    };
  
    try {
      await sock.send(JSON.stringify(msg));
      const [reply] = await sock.receive();
      const response = JSON.parse(reply.toString());
      cb(null, response);
    } 
    catch (err) { cb(err); } 
    finally { sock.close(); }
}  

/*======================================================*/
/*               USUARIOS >> DELETEUSER                 */
/*======================================================*/
/*  Esta función sirve para eliminar los datos de un    */
/*       un usuario. Almacenado en la Aplicación        */
/*                 Requiere un <token>                  */
/*     Requiere especificar el usuario que queremos     */
/*    eliminar. Devuelve un <cb> con el resultado.      */

async function deleteUser(token, idUser, cb) {
    const sock = new zmq.Dealer();
    sock.connect(URL_USERS);
  
    const msg = {
        type: "deleteUser",
        token: token,
        id: idUser,
    };
  
    try {
      await sock.send(JSON.stringify(msg));
      const [reply] = await sock.receive();
      const response = JSON.parse(reply.toString());
      cb(null, response);
    } 
    catch (err) { cb(err); } 
    finally { sock.close(); }
}   

/*======================================================*/
/*                 USUARIOS >> FOLLOW                   */
/*======================================================*/
/*     Esta función sirve para seguir a otro usuario    */
/*                 Requiere un <token>                  */
/*      Necesita una ID del usuario para seguirle       */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de follow o no        */
async function follow(token, userId, cb){
    const sock = new zmq.Dealer();
    sock.connect(URL_USERS);
  
    const msg = {
        type: "follow",
        token: token,
        id: userId,
    };
  
    try {
      await sock.send(JSON.stringify(msg));
      const [reply] = await sock.receive();
      const response = JSON.parse(reply.toString());
      cb(null, response);
    } 
    catch (err) { cb(err); } 
    finally { sock.close(); }
}   
    
/*======================================================*/
/*               USUARIOS >> UNFOLLOW                   */
/*======================================================*/
/* La función sirve para dejar de seguir a otro usuario */
/*                 Requiere un <token>                  */
/*  Necesita una ID del usuario para dejar de seguirle  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de unfollow o no      */
async function unfollow(token, userId, cb){
    const sock = new zmq.Dealer();
    sock.connect(URL_USERS);
  
    const msg = {
        type: "unfollow",
        token: token,
        id: userId,
    };
  
    try {
      await sock.send(JSON.stringify(msg));
      const [reply] = await sock.receive();
      const response = JSON.parse(reply.toString());
      cb(null, response);
    } 
    catch (err) { cb(err); } 
    finally { sock.close(); }
}
    
/*======================================================*/
/*               MENSAJES >> ADDTWEET                   */
/*======================================================*/
/*          Agregar un nuevo Mensaje de Tweet           */
/*                Requiere un <token>                   */
/*    Contiene el contendo del mensaje en <content>     */
/*          Devuelve un <cb> con el resultado.          */

async function addTweet(token, content, cb) { 
    const sock = new zmq.Dealer();
    sock.connect(URL_TWEETS);
  
    const msg = {
        type: "addTweet",
        token: token,
        data: content,
    };
  
    try {
      await sock.send(JSON.stringify(msg));
      const [reply] = await sock.receive();
      const response = JSON.parse(reply.toString());
      cb(null, response);
    } 
    catch (err) { cb(err); } 
    finally { sock.close(); }
}
    

/*======================================================*/
/*               MENSAJES >> ADDRETWEET                 */
/*======================================================*/
/*    Esta función sirve para dar retweet a un tweet    */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
async function addRetweet(token, tweetId, cb) {
    const sock = new zmq.Dealer();
    sock.connect(URL_TWEETS);
  
    const msg = {
        type: "addRetweet",
        token: token,
        id: tweetId,
    };
  
    try {
      await sock.send(JSON.stringify(msg));
      const [reply] = await sock.receive();
      const response = JSON.parse(reply.toString());
      cb(null, response);
    } 
    catch (err) { cb(err); } 
    finally { sock.close(); }
}

/*======================================================*/
/*                  MENSAJES >> LIKE                    */
/*======================================================*/
/*   Esta función sirve para dar "Me gusta" a un tweet  */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
async function like(token, tweetId, cb){
    const sock = new zmq.Dealer();
    sock.connect(URL_TWEETS);
  
    const msg = {
        type: "like",
        token: token,
        id: tweetId,
    };
  
    try {
      await sock.send(JSON.stringify(msg));
      const [reply] = await sock.receive();
      const response = JSON.parse(reply.toString());
      cb(null, response);
    } 
    catch (err) { cb(err); } 
    finally { sock.close(); }
}

/*======================================================*/
/*                 MENSAJES >> DISLIKE                  */
/*======================================================*/
/*    Función sirve para dar "No me gusta" a un tweet   */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
async function dislike(token, tweetId, cb){
    const sock = new zmq.Dealer();
    sock.connect(URL_TWEETS);
  
    const msg = {
        type: "dislike",
        token: token,
        id: tweetId,
    };
  
    try {
      await sock.send(JSON.stringify(msg));
      const [reply] = await sock.receive();
      const response = JSON.parse(reply.toString());
      cb(null, response);
    } 
    catch (err) { cb(err); } 
    finally { sock.close(); }
}

module.exports = {
    addUser, 
    updateUser,
    deleteUser,
    follow,
    unfollow,
    addTweet,
    addRetweet,
    like,
    dislike
       
}