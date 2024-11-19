const os = require("os");

var myService = { 
    InfoService: { 
        InfoPort: { 
            getMem: function(args) { 
                return {
                    total : String(os.totalmem()),
                    free : String(os.freemem())
                };
            },
            getCpus: function(args) { 

                let cpus = os.cpus();
                let ret = [] ;
                for(let cpu of cpus){
                    ret.push({
                        model: cpu.model,
                        speed: String(cpu.speed),
                        user: String(cpu.times.user),
                        sys: String(cpu.times.sys),
                        idle: String(cpu.times.idle)
                    });
                }
                return ret;
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
let wsdl= fs.readFileSync('info.wsdl', 'utf8'); 

soap.listen(server, '/info', myService, wsdl, function(){ 
    console.log('server initialized'); 
});