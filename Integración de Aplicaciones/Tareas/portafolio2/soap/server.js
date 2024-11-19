var myService = { 
    EchoService: { 
        EchoPort: { 
            echo: function(args) { 
                return {out: args.in};
            }
        }
    }
}

const http = require('http'); // create http server 
let server = http.createServer(function(request,response) { 
    response.end('404: Not Found: ' + request.url); 
}); 

server.listen(8000);

const soap = require('soap'); 
const fs = require('fs'); 
let wsdl= fs.readFileSync('echo.wsdl', 'utf8'); 

soap.listen(server, '/echo', myService, wsdl, function(){ 
    console.log('server initialized'); 
});