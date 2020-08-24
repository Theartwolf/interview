const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'iatgpebotp',
    database: 'participant',
    timezone: 'ist'
});

connection.connect((err)=>{
    if(err) {
        console.log("error",err);
    } else {
        // console.log("connection successfull");
    }
});

module.exports = {
    connection:connection
};

