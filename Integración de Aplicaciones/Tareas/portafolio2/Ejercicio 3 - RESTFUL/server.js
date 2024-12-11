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
    // req.body coger filtros para hacer WHERE
    let db = new sqlite3.Database("contacts.db");
    db.all("SELECT * FROM contacts", (err, rows) => {
        if(err) res.status(500).send();
        else res.send(rows);
    });
    db.close();
}); 
app.get('/mycontacts/contacts/:email', function(req, res) { 
    
}); 
app.post('/mycontacts/contacts', function(req, res) { 
    // Revisarmos si está lo de req.body

    // Si está. Hacemos cosas.
    let db = new sqlite3.Database("contacts.db");
    db.run(`INSERT INTO contacts VALUES ('${req.body.email}','${req.body.title}')`, (err) => {
        if (err) res.status(500).send();
        else res.send(req.body);
    });
});
app.put('/mycontacts/contacts/:email', function(req, res) { 
    
}); 
app.delete('/mycontacts/contacts/:id', function(req, res) { 
    
});

app.listen(8080);