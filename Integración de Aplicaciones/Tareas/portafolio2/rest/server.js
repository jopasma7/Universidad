let http = require('http'); 
let server = http.createServer(function(req, res) { 
    console.log('nueva peticion HTTP'); 
    res.end('Hola mundo!'); }
); 

server.listen(8080);