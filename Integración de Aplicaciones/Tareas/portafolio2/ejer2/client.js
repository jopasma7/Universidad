const url = 'http://localhost:8000/echo?wsdl';

const soap = require('soap'); 

soap.createClient(url, function (err, client) { 
    if(err) console.log(err.stack)
    else {
        console.log(JSON.stringify(client.describe()));  // show info about service

        client.getMem(function (err, res){
            if(err) console.log(err.stack);
            else console.log(JSON.stringify(res));
        });

        client.getCpus(function (err, res){
            if(err) console.log(err.stack);
            else console.log(JSON.stringify(res));
        });
 
    }
});
