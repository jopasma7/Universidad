const url = 'http://localhost:8000/echo?wsdl';

const soap = require('soap'); 

soap.createClient(url, function (err, client) { 
    if(err) console.log(err.stack)
    else {
        console.log(JSON.stringify(client.describe()));  // show info about service
        client.echo({ in: 'hello' }, function (err, res) { console.log(JSON.stringify(res)); }); 
    }
});
