
/*                 Archivo de MENSAJES                  */
/*           -------------------------------            */
/*  En este archivo encontrarás todos los mensajes de   */
/*      forma global de la aplicación Twitter Lite      */

prompt = "\x1b[34m[TW Lite]\x1b[0m : "
log = {
    invalid_credentials : "Registrando autentificación fallida para el email: <%email%> y password: <%password%>",
    user_join : "Acaba de acceder a la plataforma el usuario <%nick%> con email: <%email%>",
    follows_err : "Se ha registrado un error con el usuario con <nick>:%nick% a la hora de registrar un follow / unfollow a otro usuario.",
    new_follow : "Se ha registrado un nuevo follow del usuario con <nick>:%user_nick% al usuario con <nick>:%target_nick%.",
    new_unfollow : "Se ha eliminado el follow del usuario con <nick>:%user_nick% para el usuario con <nick>:%target_nick%.",
    new_user : "La aplicación ha registrado a un nuevo usuario: <name>:%name%, <surname>:%surname%, <email>:%email%, <nick>:%nick%, <password>:%password% en la base de datos.",
    new_update : "Se ha registrado un cambio en los datos del usuario del usuario: <name>:%name%, <surname>:%surname%, <email>:%email%, <nick>:%nick%, <password>:%password%.",
    new_tweet : "Se ha registrado un nuevo tweet creado por el usuario con <nick>:%nick% y con el contenido: %content%.",
    new_retweet : "Se ha registrado un nuevo retweet enviado por el usuario con <nick>:%nick_retweet% del tweet con id: %tweetID%, owner: %owner_nick% y contenido: %content%.",
    new_like : "Se ha registrado un nuevo like del usuario: %user_liked% al tweet con id: %tweetID% creado por: %owner_nick% y con el contenido: %content%.",
    new_dislike : "Se ha registrado un nuevo dislike del usuario: %user_disliked% al tweet con id: %tweetID% creado por: %owner_nick% y con el contenido: %content%.",
}

cmd = {
  login : {
    invalid_credentials : ">> El usuario o la contraseña especificados no existen en nuestra base de datos.",
    no_email : ">> Especifica un \x1b[33m-e <email>\x1b[0m. Utiliza \x1b[33mlogin --help\x1b[0m para más información. ",
    no_password : ">> Debes introducir un \x1b[33m-p <password>\x1b[0m. Utiliza \x1b[33mlogin --help\x1b[0m para más información. ",
    success : ">> Bievenido a Twitter \x1b[1m\x1b[33m%nick%\x1b[0m. ¿Qué tal si empezamos a Twittear?"
  },
  addUser : {
    no_param : ">> Se ha cancelado la acción para el usuario porque faltan parámetros.",
    no_name : ">> No se ha detectado el parámetro \x1b[33m-n <name>\x1b[0m. Haz uso de \x1b[33maddUser --help\x1b[0m para más información. ",
    no_surname : ">> No se ha detectado el parámetro \x1b[33m-s <surname>\x1b[0m. Haz uso de \x1b[33maddUser --help\x1b[0m para más información.",
    no_email : ">> No se ha detectado el parámetro \x1b[33m-e <email>\x1b[0m. Haz uso de \x1b[33maddUser --help\x1b[0m para más información.",
    no_password : ">> No se ha detectado el parámetro \x1b[33m-p <password>\x1b[0m. Haz uso de \x1b[33maddUser --help\x1b[0m para más información.",
    no_nick : ">> No se ha detectado el parámetro \x1b[33m-i <nick>\x1b[0m. Haz uso de \x1b[33maddUser --help\x1b[0m para más información.",
    email_exists : ">> No se ha podido completar el registro debido a que ya existe un usuario con ese email registrado.",
    nick_exists : ">> No se ha podido completar el registro debido a que ya existe un usuario con ese nick registrado.",
    success : ">> ¡Enhorabuena! te has registrado correctamente en Twitter.",
  },
  updateUser : {
    no_param : ">> Se ha cancelado la acción para el usuario porque faltan parámetros.",
    email_exists : ">> Ya existe un usuario en nuestra base de datos ese email registrado. Por favor elige otro diferente.",
    nick_exists : ">> Ya existe un usuario en nuestra base de datos con ese nick registrado. Por favor elige otro diferente.",
    success : ">> Has actualizado tus datos de usuario.",
  },
  listUsers : {
    invalid_format : ">> Error en la conversión a JSON. Utiliza \x1b[33mlistUsers --help\x1b[0m para más información.",
  },
  listFollowing : {
    invalid_format : ">> Error en la conversión a JSON. Utiliza \x1b[33mlistFollowing --help\x1b[0m para más información.",
  },
  listFollowers : {
    invalid_format : ">> Error en la conversión a JSON. Utiliza \x1b[33mlistFollowers --help\x1b[0m para más información.",
  },
  follow : {
    no_id : ">> Necesitas especificar un userID. \x1b[33mComando\x1b[0m: \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    no_length : ">> El valor del ID debe contener exactamente 24 dígitos. \x1b[33mComando\x1b[0m: \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    no_exists : ">> El usuario con userID = %userID% no existe en la base de datos.",
    already_follow : ">> Ya estás siguiendo a este usuario.",
    success : ">> Has empezado a seguir al usuario con <nick> : %nick%",
  },
  unfollow : {
    no_id : ">> Necesitas especificar un userID. \x1b[33mComando\x1b[0m: \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    no_length : ">> El valor del ID debe contener exactamente 24 dígitos. \x1b[33mComando\x1b[0m: \x1b[32munfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    no_exists : ">> El usuario con userID = %userID% no existe en la base de datos.",
    not_follow : ">> Todavía no sigues a ese usuario. Empieza a seguirle con el \x1b[33mComando\x1b[0m: \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m",
    success : ">> Dejaste de seguir al usuario con <nick> : %nick%",
  },
  addTweet : {
    no_content : ">> Necesitas especificar un contenido del Tweet. \x1b[33mComando\x1b[0m: \x1b[32maddTweet\x1b[0m -c \x1b[32m<content>\x1b[0m",
    success : ">> Has creado un nuevo Tweet.",
  },
  addRetweet : {
    no_id : ">> Necesitas especificar un tweetID. Haz uso de \x1b[33maddRetweet --help\x1b[0m para más información.",
    no_length : ">> El valor del ID debe contener exactamente 24 dígitos. Haz uso de \x1b[33maddRetweet --help\x1b[0m para más información.",
    no_exists : ">> El tweet con ID = %tweetID% no existe en la base de datos.",
    already_retweet : ">> Ya diste retweet previamente a este Tweet.",
    your_tweet : ">> No puedes dar retweet a tus propios Tweets.",
    success : ">> Has dado retweet al Tweet publicado por %nick%",
  },
  listTweets : {
    invalid_format : ">> Error en la conversión a JSON. Utiliza \x1b[33mlistTweets --help\x1b[0m para más información.",
  },
  like : {
    no_id : ">> Necesitas especificar un tweetID. \x1b[33mComando\x1b[0m: \x1b[32mlike\x1b[0m --id \x1b[32m<tweetID>\x1b[0m",
    no_length : ">> El valor del ID debe contener exactamente 24 dígitos. \x1b[33mComando\x1b[0m: \x1b[32mlike\x1b[0m --id \x1b[32m<tweetID>\x1b[0m",
    no_exists : ">> El tweet con ID = %tweetID% no existe en la base de datos.",
    already_like : ">> Ya diste like previamente a este Tweet.",
    your_tweet : ">> No puedes dar like a tus propios Tweets.",
    success : ">> Has dado un like al Tweet publicado por %nick%",
  },
  dislike : {
    no_id : ">> Necesitas especificar un tweetID. \x1b[33mComando\x1b[0m: \x1b[32mdislike\x1b[0m --id \x1b[32m<tweetID>\x1b[0m",
    no_length : ">> El valor del ID debe contener exactamente 24 dígitos. \x1b[33mComando\x1b[0m: \x1b[32mdislike\x1b[0m --id \x1b[32m<tweetID>\x1b[0m",
    no_exists : ">> El tweet con ID = %tweetID% no existe en la base de datos.",
    already_dislike : ">> Ya diste dislike previamente a este Tweet.",
    your_tweet : ">> No puedes dar dislike a tus propios Tweets.",
    success : ">> Has dado un dislike al Tweet publicado por %nick%",
  },
  err : {
    no_token : ">> Para poder ejecutar este comando tienes que loguearte en Twitter Lite.",
  },
  exit : {
    logged : "\x1b[34m>> ¿Ya te marchas \x1b[33m%nick%\x1b[0m\x1b[34m? ¡Te veo más tarde!\x1b[0m",
    not_logged : "\x1b[34m>> ¿Tan pronto te vas? Si todavía no accediste a la APP. Bueno... ¡¡Nos vemos pronto!!\x1b[0m"
  } 
}

/*
login -e test -p test
listUsers -q '{ name : "test" }'
*/
menu =
`
=================================================
                 MENÚ PRINCIPAL 
=================================================

    ••••• COMANDOS PARA LOS USUARIOS •••••

\x1b[33m1.\x1b[0m \x1b[32mlistUsers\x1b[0m -q \x1b[32m<query>\x1b[0m -ini \x1b[32m<ini>\x1b[0m -count \x1b[32m<count>\x1b[0m\x1b[0m\x1b[0m -sort \x1b[32m<sort>\x1b[0m                       
\x1b[33m2.\x1b[0m \x1b[32mupdateUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m    
\x1b[33m3.\x1b[0m \x1b[32mlistFollowing\x1b[0m -q \x1b[32m<query>\x1b[0m -ini \x1b[32m<ini>\x1b[0m -count \x1b[32m<count>\x1b[0m\x1b[0m\x1b[0m -sort \x1b[32m<sort>\x1b[0m                                    
\x1b[33m4.\x1b[0m \x1b[32mlistFollowers\x1b[0m -q \x1b[32m<query>\x1b[0m -ini \x1b[32m<ini>\x1b[0m -count \x1b[32m<count>\x1b[0m\x1b[0m\x1b[0m -sort \x1b[32m<sort>\x1b[0m                                    
\x1b[33m5.\x1b[0m \x1b[32mfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m 
\x1b[33m6.\x1b[0m \x1b[32munfollow\x1b[0m --id \x1b[32m<userID>\x1b[0m 

    ••••• COMANDOS PARA LOS TWEETS •••••

\x1b[33m7.\x1b[0m \x1b[32maddTweet\x1b[0m -c \x1b[32m<content>\x1b[0m 
\x1b[33m8.\x1b[0m \x1b[32maddRetweet\x1b[0m --id \x1b[32m<tweetID>\x1b[0m                       
\x1b[33m9.\x1b[0m \x1b[32mlistTweets\x1b[0m -q \x1b[32m<query>\x1b[0m -ini \x1b[32m<ini>\x1b[0m -count \x1b[32m<count>\x1b[0m\x1b[0m\x1b[0m -sort \x1b[32m<sort>\x1b[0m   
\x1b[33m10.\x1b[0m \x1b[32mlike\x1b[0m --id \x1b[32m<tweetID>\x1b[0m                                  
\x1b[33m11.\x1b[0m \x1b[32mdislike\x1b[0m --id \x1b[32m<tweetID>\x1b[0m                                    

\x1b[33m12.\x1b[0m \x1b[32mexit\x1b[0m

Para más información acerca de un comando
Haz uso de \x1b[33m<cmd> --help\x1b[0m
`;

login_menu =
`
=======================================================================
                            LOGIN MENÚ 
=======================================================================
\x1b[33m1.\x1b[0m \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m
\x1b[33m2.\x1b[0m \x1b[32maddUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m3.\x1b[0m \x1b[32mexit\x1b[0m

Haz uso de los comandos anteriores para iniciar sesión o registrarse.
Para más información acerca de un comando utiliza \x1b[33m<cmd> --help\x1b[0m
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

 • \x1b[33mRequisitos\x1b[0m: Todos los parámetros son necesarios para la creación de un nuevo usuario.

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
   - listUsers -q '{ name : "alex" }' -c 1
 
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
   - listFollowing -q '{ name : "alex" }' -c 10
  
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
   - listFollowers -q '{ name : "alex" }' -c 10

 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    addTweet : 
`
=======================================================================
                 MENÚ DE AYUDA : COMANDO ADDTWEET
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Añade un nuevo mensaje de Tweet a la base de datos.  
 • \x1b[33mUso\x1b[0m: \x1b[32maddTweet\x1b[0m -c \x1b[32m<content>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |-c| : <content>    ->  Cuerpo o contenido del mensaje.

 • \x1b[33mRequisitos\x1b[0m: 
   - Se deben insertar comillas simples en el contenido del mensaje.
 • \x1b[33mEjemplo de uso\x1b[0m:
   - addTweet -c 'Esto es una prueba de Tweet'

 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    addRetweet : 
`
=======================================================================
                 MENÚ DE AYUDA : COMANDO ADDRETWEET
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Añade un nuevo Retweet de algún mensaje de Tweet.  
 • \x1b[33mUso\x1b[0m: \x1b[32maddRetweet\x1b[0m --id \x1b[32m<tweetID>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |--id| : <tweetID>    ->  ID del Tweet que se quiere retweetear.

 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    listTweets : 
`
=======================================================================
                 MENÚ DE AYUDA : COMANDO LISTTWEETS
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Lista todos los mensajes de Tweet y Retweet.  
 • \x1b[33mUso\x1b[0m: \x1b[32mlistTweets\x1b[0m -q \x1b[32m<query>\x1b[0m -i \x1b[32m<ini>\x1b[0m -c \x1b[32m<count>\x1b[0m -s \x1b[32m<sort>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |-q| : <query>      ->  Especifica una consulta.
    |-i| : <ini>        ->  Índice del primer resultado mostrado.
    |-c| : <count>      ->  Índica el número máximo de resultados mostrados.
    |-s| : <sort>       ->  Ordenar los resultados por +|- campos.

 • \x1b[33mEspecificaciones\x1b[0m: 
   - Se mostrará una lista de los Tweets y los Retweets juntos.

 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    like : 
`
=======================================================================
                      MENÚ DE AYUDA : LIKE
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Da "Me gusta" a algún tweet publicado.  
 • \x1b[33mUso\x1b[0m: \x1b[32mlike\x1b[0m --id \x1b[32m<tweetID>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |--id| : <tweetID>    ->  ID del Tweet al que se quiere dar like.

 • \x1b[33mEspecificaciones\x1b[0m: 
   - Solamente se podrá dar Like una vez al mismo Tweet.
   - No se podrá dar like a un tweet publicado por el propio usuario.
   - En caso de haber dado Like a algún Tweet, se eliminará el Dislike en caso de existir.

 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,
    like : 
`
=======================================================================
                      MENÚ DE AYUDA : DISLIKE
=======================================================================
 • \x1b[33mDescripción\x1b[0m: Da "No me gusta" a algún tweet publicado.  
 • \x1b[33mUso\x1b[0m: \x1b[32mdislike\x1b[0m --id \x1b[32m<tweetID>\x1b[0m.
 • \x1b[33mVariables\x1b[0m:
    |--id| : <tweetID>    ->  ID del Tweet al que se quiere dar dislike.

 • \x1b[33mEspecificaciones\x1b[0m: 
   - Solamente se podrá dar Dislike una vez al mismo Tweet.
   - No se podrá dar dislike a un tweet publicado por el propio usuario.
   - En caso de haber dado Dislike a algún Tweet, se eliminará el Like en caso de existir.

 NOTA: \x1b[90mLa ejecución del comando solamente estará disponible una vez autenticado.\x1b[0m
`,

}

module.exports = {
    prompt, menu, login_menu, help, log, cmd
}