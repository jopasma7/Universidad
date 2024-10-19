
/*                 Archivo de MENSAJES                  */
/*           -------------------------------            */
/*  En este archivo encontrarás todos los mensajes de   */
/*      forma global de la aplicación Twitter Lite      */

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

add = {
    log : {
        no_param : "La creación del usuario se ha anulado debido a que falta algún parámetro obligatorio.",
        user_exists : "La creación del usuario se ha anulado debido a que ya existe un usuario registrado con email <%email%> o nick <%nick%> en la base de datos.",
    },
    no_param : ">> No se ha podido crear el usuario porque faltan parámetros.",
    no_name : ">> Tienes que especificar un nombre para el registro.",
    no_surname : ">> Tienes que especificar un apellido para el registro.",
    no_email : ">> Tienes que especificar un email para el registro.",
    no_password : ">> Tienes que especificar una contraseña para el registro.",
    no_nick : ">> Tienes que especificar un nick para el registro.",
    email_exists : ">> Ya existe un usuario en nuestra base de datos ese email registrado.",
    nick_exists : ">> Ya existe un usuario en nuestra base de datos con ese nick registrado.",
    
}

list = {
    log : {
        no_logged_token : "El sistema ha rechazado una petición de listar usuarios por token inválido: <%token%>",
    },
    no_logged : "Para poder ejecutar este comando tienes que loguearte en Twitter Lite.",
}

menu =
`
Bienvenido a la Aplicación de Twitter Lite.

Comandos Disponibles :

\x1b[33m1.\x1b[0m \x1b[32mlogin\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m
\x1b[33m2.\x1b[0m \x1b[32maddUser\x1b[0m -n \x1b[32m<name>\x1b[0m -s \x1b[32m<surname>\x1b[0m -e \x1b[32m<email>\x1b[0m -p \x1b[32m<password>\x1b[0m -i \x1b[32m<nick>\x1b[0m
\x1b[33m3.\x1b[0m \x1b[32mlistUsers\x1b[0m -q \x1b[32m<query>\x1b[0m -i \x1b[32m<init>\x1b[0m -c \x1b[32m<count>\x1b[0m
\x1b[33m4.\x1b[0m \x1b[32mexit\x1b[0m - cerrar la aplicación

`;

module.exports = {
    login, add, list, menu
}