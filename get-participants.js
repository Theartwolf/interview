const {connection} = require('./db/mysql-connect.js');

get_participants = (participants,res)=>{

    connection.query("select * from participants",(err, row, field)=>{
        //row is the object containing query result
        //participants in an array containing query result
        if(err)
            throw error;
        for(i in row)
            participants.push(row[i]);
        res.send(participants);
        return participants;
    });
}
module.exports = {
    get_participants
}