
/*                 Archivo de MENSAJES                  */
/*           -------------------------------            */
/*  En este archivo encontrarás todos los mensajes de   */
/*      forma global de la aplicación Twitter Lite      */

prompt = "\x1b[34m[TW Lite]\x1b[0m : "
login = {
    log : {
        invalid_credentials : "Registrando autentificación fallida para el email: <%email%> y password: <%password%>",
        no_email_or_pass : "Autentificación fallida por falta del parámetro <email> o <password>.",
        user_join : "Acaba de acceder a la plataforma el usuario <%user%> con email: <%email%>",
    },
    invalid_credentials : ">> El usuario o la contraseña especificados no existen en nuestra base de datos.",
    no_email : ">> Necesitas especificar un email. \x1b[33mComando\x1b[0m: \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m ",
    no_password : ">> Debes introducir una contraseña. \x1b[33mComando\x1b[0m: \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m o \x1b[32m<password>\x1b[0m.",
    welcome : ">> Bievenido a Twitter %user%"
} 

follows = {
    log : {
        err : "Se ha registrado un error con el usuario con <nick>:%nick% a la hora de registrar un follow / unfollow a otro usuario.",
        complete : "Se ha registrado un nuevo follow del usuario con <nick>:%user_nick% al usuario con <nick>:%target_nick%.",
        unfollow_complete : "Se ha registrado un nuevo unfollow para del usuario con <nick>:%user_nick% al usuario con <nick>:%target_nick%.",
    },
    no_userID : ">> Necesitas especificar un userID. \x1b[33mComando\x1b[0m: \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    unfollow_no_userID : ">> Necesitas especificar un userID. \x1b[33mComando\x1b[0m: \x1b[32munfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    no_length : ">> El valor del ID debe contener exactamente 24 dígitos. \x1b[33mComando\x1b[0m: \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    unfollow_no_length : ">> El valor del ID debe contener exactamente 24 dígitos. \x1b[33mComando\x1b[0m: \x1b[32munfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    no_exists : ">> El usuario con userID = %userID% no existe en la base de datos.",
    already_follow : ">> Ya estás siguiendo a este usuario.",
    not_follow : ">> Todavía no sigues a ese usuario. Empieza a seguirle con el \x1b[33mComando\x1b[0m: \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    complete : ">> Has empezado a seguir al usuario con <nick> : %nick%",
    unfollow_complete : ">> Dejaste de seguir al usuario con <nick> : %nick%",
}


modify = {
    log : {
        cancel_add_no_param : "La creación del usuario se ha anulado debido a que falta algún parámetro obligatorio.",
        user_exists : "La creación / modificación del usuario se ha anulado debido a que ya existe un usuario registrado con email <%email%> o nick <%nick%> en la base de datos.",
        user_added : "La aplicación ha registrado a un nuevo usuario con email <%email%> y nick <%nick%> en la base de datos.",
        user_updated : "Cambio en los datos del usuario del usuario: <name>:%name%, <surname>:%surname%, <email>:%email%, <nick>:%nick%, <password>:%password%.",
    },
    no_param : ">> Se ha cancelado la acción para el usuario porque faltan parámetros.",
    no_name : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <nombre>",
    no_surname : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <apellido>",
    no_email : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <email>",
    no_password : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <password>",
    no_nick : ">> Se ha cancelado la acción para el usuario porque falta el parámetro <nick>",
    email_exists : ">> Ya existe un usuario en nuestra base de datos ese email registrado.",
    nick_exists : ">> Ya existe un usuario en nuestra base de datos con ese nick registrado.",
    user_registered : ">> ¡Enhorabuena! te has registrado correctamente en Twitter.",
    user_updated : ">> Has actualizado tus datos de usuario.",
}

token = {
    log_no_token : "El sistema ha rechazado una petición de listar usuarios por token inválido: <%token%>",
    no_logged : "Para poder ejecutar este comando tienes que loguearte en Twitter Lite.",
}

/*
login -e test -p test
listUsers -q {name:'test'}
*/
menu =
`
=======================================================================
                            MENÚ PRINCIPAL 
=======================================================================

\x1b[33m1.\x1b[0m \x1b[32mlistUsers\x1b[0m -q \x1b[32m<query>\x1b[0m -ini \x1b[32m<ini>\x1b[0m -count \x1b[32m<count>\x1b[0m\x1b[0m\x1b[0m -sort \x1b[32m<sort>\x1b[0m                       
\x1b[33m2.\x1b[0m \x1b[32mupdateUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m    
\x1b[33m3.\x1b[0m \x1b[32mlistFollowing\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m                                     
\x1b[33m4.\x1b[0m \x1b[32mlistFollowers\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m                                     
\x1b[33m5.\x1b[0m \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m 
\x1b[33m6.\x1b[0m \x1b[32munfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m 
\x1b[33m7.\x1b[0m \x1b[32mexit\x1b[0m

Para más información acerca de un comando específico utiliza \x1b[33m<cmd> --help\x1b[0m
Esto te ayudará a comprender con más detalle valor de cada comando.

`;

login_menu =
`
Bienvenido a la Aplicación de Twitter Lite.

Comandos Disponibles :

\x1b[33m1.\x1b[0m \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m
\x1b[33m2.\x1b[0m \x1b[32maddUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m3.\x1b[0m \x1b[32mhelp\x1b[0m - Mostrar el menú de ayuda.
\x1b[33m4.\x1b[0m \x1b[32mexit\x1b[0m - Cerrar la aplicación.

`;

help = {
    login : 
`
=======================================================================
                   MENÚ DE AYUDA : COMANDO LOGIN
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Comando de autenticación para un usuario.  
 • \x1b[33mUso\x1b[0m: \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |-e| : <email>      ->  Correo electrónico asociado a la cuenta de usuario.
    |-p| : <password>   ->  Contraseña registrada para el usuario.

 NOTA: \x1b[90mLa ejecución del comando no está disponible una vez autenticado.\x1b[0m
`,
    add : 
`
=======================================================================
                   MENÚ DE AYUDA : COMANDO ADDUSER
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Registrar a un nuevo usuario en la base de datos.  
 • \x1b[33mUso\x1b[0m: \x1b[32maddUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m o \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |-n| : <name>       ->  Nombre del usuario que se está registrando.
    |-s| : <surname>    ->  Primer apellido del usuario.
    |-e| : <email>      ->  Correo electrónico vinculado a la cuenta de usuario.
    |-p| : <password>   ->  Contraseña deseada para el usuario.
    |-i| : <nick>       ->  Apodo o alias deseado dentro de la aplicación.

 NOTA: \x1b[90mLa ejecución del comando no está disponible una vez autenticado.\x1b[0m
`,
    update : 
`
=======================================================================
                 MENÚ DE AYUDA : COMANDO UPDATEUSER
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Actualiza algún valor o campo en los datos del usuario logueado.  
 • \x1b[33mUso\x1b[0m: \x1b[32mupdateUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m o \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |-n| : <name>       ->  Nombre del usuario.
    |-s| : <surname>    ->  Primer apellido del usuario.
    |-e| : <email>      ->  Correo electrónico vinculado a la cuenta de usuario.
    |-p| : <password>   ->  Contraseña deseada para el usuario.
    |-i| : <nick>       ->  Apodo o alias deseado dentro de la aplicación.

 • \x1b[33mEspecificaciones\x1b[0m: 
   - La modificación de algún campo del usuario puede llevarse a cabo de carácter individual.
   - Por lo cual no es necesario colocar todas las variables en caso de únicamente querer actualizar un campo.

 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    listUsers : 
`
=======================================================================
                   MENÚ DE AYUDA : COMANDO LISTUSERS
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Listar a los usuarios registrados en la aplicación.  
 • \x1b[33mUso\x1b[0m: \x1b[32mlistUsers\x1b[0m -q \x1b[32m<query>\x1b[0m -i \x1b[32m<ini>\x1b[0m -c \x1b[32m<count>\x1b[0m -s \x1b[32m<sort>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |-q| : <query>      ->  Especifica una consulta.
    |-i| : <ini>        ->  Índice del primer resultado mostrado.
    |-c| : <count>      ->  Índica el número máximo de resultados mostrados.
    |-s| : <sort>       ->  Ordenar los resultados por +|- campos.
 
 • \x1b[33mEspecificaciones\x1b[0m: 
   - El uso del comando no va ligado a sus variables. Se puede ejecutar con o sin ellas.
 • \x1b[33mEjemplo de uso\x1b[0m:
   - listUsers -q {name:"alex"} -c 1
 
 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    follows : 
`
=======================================================================
                  MENÚ DE AYUDA : FOLLOW / UNFOLLOW
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Empezar / Dejar de seguir a un usuario registrado en la base de datos.  
 • \x1b[33mUso\x1b[0m: 
   - \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m.
   - \x1b[32munfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |--id| : <userID>   ->  Especifica la ID del usuario que deseas empezar / dejar de seguir.
  
 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    listFollowing : 
`
=======================================================================
                MENÚ DE AYUDA : COMANDO LISTFOLLOWING
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Muestra una lista de todos los usuarios a los que sigues (follow).  
 • \x1b[33mUso\x1b[0m: \x1b[32mlistFollowing\x1b[0m -q \x1b[32m<query>\x1b[0m -i \x1b[32m<ini>\x1b[0m -c \x1b[32m<count>\x1b[0m -s \x1b[32m<sort>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |-q| : <query>      ->  Especifica una consulta.
    |-i| : <ini>        ->  Índice del primer resultado mostrado.
    |-c| : <count>      ->  Índica el número máximo de resultados mostrados.
    |-s| : <sort>       ->  Ordenar los resultados por +|- campos.

 • \x1b[33mEspecificaciones\x1b[0m: 
   - El uso del comando no va ligado a sus variables. Se puede ejecutar con o sin ellas.
 • \x1b[33mEjemplo de uso\x1b[0m:
   - listFollowing -q {name:"alex"} -c 10
  
 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    listFollowers : 
`
=======================================================================
                MENÚ DE AYUDA : COMANDO LISTFOLLOWERS
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Muestra una lista de todos los usuarios que te siguen (follow).  
 • \x1b[33mUso\x1b[0m: \x1b[32mlistFollowers\x1b[0m -q \x1b[32m<query>\x1b[0m -i \x1b[32m<ini>\x1b[0m -c \x1b[32m<count>\x1b[0m -s \x1b[32m<sort>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |-q| : <query>      ->  Especifica una consulta.
    |-i| : <ini>        ->  Índice del primer resultado mostrado.
    |-c| : <count>      ->  Índica el número máximo de resultados mostrados.
    |-s| : <sort>       ->  Ordenar los resultados por +|- campos.

 • \x1b[33mEspecificaciones\x1b[0m: 
   - El uso del comando no va ligado a sus variables. Se puede ejecutar con o sin ellas.
 • \x1b[33mEjemplo de uso\x1b[0m:
   - listFollowers -q {name:"alex"} -c 10

 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,

}

module.exports = {
    login, modify, token, menu, login_menu, prompt, help, follows
}