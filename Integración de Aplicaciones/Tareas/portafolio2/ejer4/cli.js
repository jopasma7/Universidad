const axios = require("axios");

function help(){
    console.log(`
        Usage: node cli <command>
        Available Commands:
            - add <email> <title>
            - list [<query>]
            - rm <email>
            - update <email> <title>
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
                    console.log(err.response.data);
                    console.log(err.response.status);
                    console.log(err.response.headers);
                });
            break;
        case 'list':
            axios.get("http://localhost:8080/mycontacts/contacts")
            .then(resp => {
                console.log("success: " + JSON.stringify(resp.data));
            })
            .catch(err => {
                console.log("error: " +err.stack);
                console.log(err.response.data);
                console.log(err.response.status);
                console.log(err.response.headers);
            });
            break;
        case 'rm':
            break;
        case 'update':
            break;
    }
}