const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");

let app = express();
app.use(bodyParser.json());

let db = new sqlite3.Database("contacts.db");
db.run("CREATE TABLE IF NOT EXISTS contacts(email VARCHAR(32), title VARCHAR(32))");
db.close();

// Registro de Rutas
app.get('/mycontacts/contacts', function(req, res) { 
    let db = new sqlite3.Database("contacts.db");
    db.all("SELECT * FROM contacts", (err, rows) => {
        if(err) res.status(500).send();
        else res.send(rows);
    });
    db.close();
}); 
app.get('/mycontacts/contacts/:email', function(req, res) { 
    let db = new sqlite3.Database("contacts.db");
    db.get(`SELECT * FROM contacts WHERE email = '${req.params.email}'`, (err, row) => {
        if(err) res.status(500).send();
        else if(row) res.send(row);
        else res.status(404).send();
    });
    db.close();
}); 
app.post('/mycontacts/contacts', function(req, res) { 
    let db = new sqlite3.Database("contacts.db");
    db.run(`INSERT INTO contacts VALUES ('${req.body.email}', '${req.body.title}')`, (err) => {
        if (err) res.status(500).send();
        else res.send(req.body);
    });
    db.close();
});
app.put('/mycontacts/contacts/:email', function(req, res) { 
    let db = new sqlite3.Database("contacts.db");
    db.run(`UPDATE contacts SET title = '${req.body.title}' WHERE email = '${req.params.email}'`, (err) => {
        if (err) res.status(500).send();
        else res.send(req.body);
    });
    db.close();
}); 
app.delete('/mycontacts/contacts/:email', function(req, res) { 
    let db = new sqlite3.Database("contacts.db");
    db.run(`DELETE FROM contacts WHERE email = '${req.params.email}'`, (err) => {
        if (err) res.status(500).send();
        else res.send();
    });
    db.close();
});

app.listen(8080);
console.log("El servidor de Contactos está activado en el puerto 8080");