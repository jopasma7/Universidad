const axios = require("axios");

function help(){
    console.log(`
        Usage: node cli <command>
        Available Commands:
            - add <email> <title>
            - list [<query>]
            - rm <email>
            - update <email> <newEmail> <newTitle>
        `);
}

if(process.argv.length <= 2) help();
else{
    switch(process.argv[2]){
        case 'add':
            let contact = {email: process.argv[3], title: process.argv[4]};
            axios.post("http://localhost:8080/mycontacts/contacts", contact)
                .then(resp => {
                    console.log("success: " + JSON.stringify(resp.data));
                })
                .catch(err => {
                    console.log("error: " +err.stack);
                });
        break;
        case 'list':
            axios.get("http://localhost:8080/mycontacts/contacts")
            .then(resp => {
                console.log("success: " + JSON.stringify(resp.data));
            })
            .catch(err => {
                console.log("error: " +err.stack);
            });
        break;
        case 'rm':
            axios.delete("http://localhost:8080/mycontacts/contacts/" + process.argv[3])
            .then(resp => {
                console.log("success: " + JSON.stringify(resp.data));
            })
            .catch(err => {
                console.log("error: " +err.stack);
            });
        break;
        case 'update':
            let con = {email: process.argv[4], title: process.argv[5]};
            axios.put("http://localhost:8080/mycontacts/contacts/" + process.argv[3], con)
            .then(resp => {
                console.log("success: " + JSON.stringify(resp.data));
            })
            .catch(err => {
                console.log("error: " +err.stack);
            });
        break;
    }
}