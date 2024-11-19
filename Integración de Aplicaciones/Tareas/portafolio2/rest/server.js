var express = require('express'); 
var app = express(); // mount middleware 
app.use(express.static('./public')); //contenido estático en './public' 
app.listen(8080);