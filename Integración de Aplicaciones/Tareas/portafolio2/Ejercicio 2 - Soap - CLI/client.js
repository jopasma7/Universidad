const url = 'http://localhost:8000/info?wsdl';
const soap = require('soap');

soap.createClient(url, function (err, client) {
    if (err) console.log('Ha ocurrido un error al crear el cliente SOAP:', err.stack);
    else {
        console.log('Client description:', JSON.stringify(client.describe()));
        client.getMem(function (err, res) {
            if (err) console.log('Error al llamar a la función getMem:', err.stack);
            else console.log('Respuesta de getMem:', JSON.stringify(res));
        });

        client.getCpus(function (err, res) {
            if (err) console.log('Error al llamar a la función getCpus:', err.stack);
            else console.log('Respuesta de getCpus:', JSON.stringify(res));    
        });
    }
});