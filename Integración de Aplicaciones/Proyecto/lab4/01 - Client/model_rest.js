const axios = require("axios");
const URL_USERS = 'http://localhost:8080/twitter';
const URL_TWEETS = 'http://localhost:8085/twitter';
const messages = require("./messages"); 

/*======================================================*/
/*                  USUARIOS >> LOGIN                   */
/*======================================================*/
/*  Esta función sirve para iniciar sesión en Twitter   */
/*           Requiere un <email> y <password>           */
/*    Devuelve un <cb> con el resultado. Indicando      */
/*         Si logró o falló la autentificación.         */

function login(email, password, cb) {  
    if (!email) cb(print(messages.cmd.login.no_email, 401));
    else if (!password) cb(print(messages.cmd.login.no_password, 401));
    else {
        axios.post(URL_USERS + '/sessions',
            { email: email, password: password })
            .then(res => {
                cb(null, res.data.token, res.data.user)
            })
            .catch(err => {
                cb(err);
            });
    }
}


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
    if (!user.name) cb(print(messages.cmd.addUser.no_name, 400));
    else if (!user.surname) cb(print(messages.cmd.addUser.no_surname, 400));
    else if (!user.email) cb(print(messages.cmd.addUser.no_email, 401));
    else if (!user.nick) cb(print(messages.cmd.addUser.no_nick, 401));
    else if (!user.password) cb(print(messages.cmd.addUser.no_password, 401));
    else {
        axios.post(URL_USERS + '/users', user)
            .then(res => {
                cb(null, res.data)
            })
            .catch(err => {
                cb(err);
            });
            
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

function updateUser(token, newUserData, cb) {
    // Hacemos la petición PUT con el email del usuario
    axios.put(`${URL_USERS}/users/${token}`, newUserData, {
        params: { token: token } // El token se pasa como parámetro de consulta
    })
    .then(res => {
        cb(null, res.data); // Devuelve los datos del usuario actualizado
    })
    .catch(err => {
        cb(err); // Devuelve el error en caso de fallo
    });
}

/*======================================================*/
/*               USUARIOS >> LISTUSERS                  */
/*======================================================*/
/* Esta función sirve para listar a todos los usuarios  */
/*         de la base de datos de la aplicación         */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listUsers(token, opts, cb) {  
    axios.get(URL_USERS + '/users', {
        params: { token: token, opts: JSON.stringify(opts) }
    })
        .then(res => {
            cb(null, res.data)
        })
        .catch(err => {
            cb(err);
        });
}

/*======================================================*/
/*             USUARIOS >> LISTFOLLOWING                */
/*======================================================*/
/* Esta función sirve para listar a todos los usuarios  */
/*         a los que el usuario sigue (follow)          */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listFollowing(token, opts, cb) {  
    axios.get(URL_USERS + '/users/' + token + '/following',
        {
            params: { token: token, opts: JSON.stringify(opts) }
        })
        .then(res => {
            cb(null, res.data)
        })
        .catch(err => {
            cb(err);
        });
}

/*======================================================*/
/*             USUARIOS >> LISTFOLLOWERS                */
/*======================================================*/
/*       Esta función sirve para listar a todos         */
/*     los usuarios que sigue el usuario (follow)       */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listFollowers(token, opts, cb) {  
    axios.get(URL_USERS + '/users/' + token + '/followers',
        {
            params: { token: token, opts: JSON.stringify(opts) }
        })
        .then(res => {
            cb(null, res.data)
        })
        .catch(err => {
            cb(err);
        });
}

/*======================================================*/
/*                 USUARIOS >> FOLLOW                   */
/*======================================================*/
/*     Esta función sirve para seguir a otro usuario    */
/*                 Requiere un <token>                  */
/*      Necesita una ID del usuario para seguirle       */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de follow o no        */
function follow(token, userId, cb){
    axios.post(`${URL_USERS}/users/${token}/following`, 
        { userId: userId }, 
        { params: { token: token } }
    )
        .then(res => {
            cb(null, res.data); // Enviar los datos al callback en caso de éxito
        })
        .catch(err => {
            cb(err);
        });
}


/*======================================================*/
/*               USUARIOS >> UNFOLLOW                   */
/*======================================================*/
/* La función sirve para dejar de seguir a otro usuario */
/*                 Requiere un <token>                  */
/*  Necesita una ID del usuario para dejar de seguirle  */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        si funcionó la petición de unfollow o no      */
function unfollow(token, userId, cb){
    axios.delete(`${URL_USERS}/users/${token}/following/${userId}`, { params: { token: token } }) // Token en la query string
        .then(res => {
            cb(null, res.data); // Enviar los datos al callback en caso de éxito
        })
        .catch(err => {
            cb(err);
        });
}

/*======================================================*/
/*               MENSAJES >> ADDTWEET                   */
/*======================================================*/
/*          Agregar un nuevo Mensaje de Tweet           */
/*                Requiere un <token>                   */
/*    Contiene el contendo del mensaje en <content>     */
/*          Devuelve un <cb> con el resultado.          */

function addTweet(token, content, cb) {  
    // Comprobación de los parámetros. Si falta alguno imprime error en cliente y servidor (Log)
    if (!content) cb(print(messages.cmd.addTweet.no_content, 400));
    else {
        axios.post(URL_TWEETS + '/tweets', 
            { content: content }, 
            { params: { token: token } }
        )
        .then(res => {
            cb(null, res.data);
        })
        .catch(err => {
            cb(err);
        });
    }
}

/*======================================================*/
/*                MENSAJES >> LISTTWEETS                */
/*======================================================*/
/*         Esta función sirve para listar todos         */
/*        los tweets que hay en la base de datos        */
/*                 Requiere un <token>                  */
/*    Se pueden especificar <opts> que son opciones.    */
/*    Devuelve un <cb> con el resultado. Que indica     */
/*        la lista de usuarios que hemos listado        */

function listTweets(token, opts, cb) {  
    axios.get(URL_TWEETS + '/tweets', {
        params: { token: token, opts: JSON.stringify(opts) }
    })
    .then(res => {
        cb(null, res.data)
    })
    .catch(err => {
        cb(err);
    });
}

/*======================================================*/
/*               MENSAJES >> ADDRETWEET                 */
/*======================================================*/
/*    Esta función sirve para dar retweet a un tweet    */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
function addRetweet(token, tweetId, cb) {
    axios.post(`${URL_TWEETS}/tweets/${tweetId}/retweets`, {}, { params: { token: token } }) // Token en la query string
        .then(res => {
            cb(null, res.data); // Enviar los datos al callback en caso de éxito
        })
        .catch(err => {
            cb(err);
        });
}

/*======================================================*/
/*                  MENSAJES >> LIKE                    */
/*======================================================*/
/*   Esta función sirve para dar "Me gusta" a un tweet  */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
function like(token, tweetId, cb){
    axios.post(`${URL_TWEETS}/tweets/${tweetId}/likes`, {}, { params: { token: token } }) // Token en la query string
        .then(res => {
            cb(null, res.data); // Enviar los datos al callback en caso de éxito
        })
        .catch(err => {
            cb(err);
        });
}

/*======================================================*/
/*                 MENSAJES >> DISLIKE                  */
/*======================================================*/
/*    Función sirve para dar "No me gusta" a un tweet   */
/*                 Requiere un <token>                  */
/*     Necesita una ID del Tweet para identificarlo     */
/*          Devuelve un <cb> con el resultado.          */
function dislike(token, tweetId, cb){
    axios.post(`${URL_TWEETS}/tweets/${tweetId}/dislikes`, {}, { params: { token: token } }) // Token en la query string
    .then(res => {
        cb(null, res.data); // Enviar los datos al callback en caso de éxito
    })
    .catch(err => {
        cb(err);
    });
}

function print(message, code = 0) {
    const statusCodes = {
      100: '[100 Info]',
      200: '[200 Éxito]',
      201: '[201 Created]',
      400: '[400 Bad Request]',
      401: '[401 Unauthorized]',
      403: '[403 Forbidden]',
      404: '[404 Not Found]',
      405: '[404 Not Allowed]',
      409: '[409 Conflict]',
      422: '[422 Unprocessable Entity]',
      500: '[500 Internal Server Error]',
      501: '[501 Not Implemented]',
    };
  
    const colors = {
      info: '\x1b[34m', // Azul
      success: '\x1b[32m', // Verde
      error: '\x1b[31m', // Rojo
      reset: '\x1b[0m' // Reset
    };
  
    let newMSG = '';
    
    if (code == 100) {
        newMSG = `${colors.info}${statusCodes[code] || '[Info]'}${colors.reset} ${message}`;
    } else if (code >= 200 && code < 300) {
      newMSG = `${colors.success}${statusCodes[code] || '[Exito]'}${colors.reset} ${message}`;
    } else if (code >= 400 && code < 500) {
      newMSG = `${colors.error}${statusCodes[code] || '[Client Error]'}${colors.reset} ${message}`;
    } else if (code >= 500) {
      newMSG = `${colors.error}${statusCodes[code] || '[Server Error]'}${colors.reset} ${message}`;
    } else {
      newMSG = `${colors.error}${message}${colors.reset}`;
    }
  
    return new Error(newMSG);
  }


module.exports = {
    addUser,    
    login,    
    listUsers,
    updateUser,
    follow,
    unfollow,
    listFollowing,
    listFollowers,
    addTweet,
    addRetweet,
    listTweets,
    like,
    dislike
}