const express = require('express');
const cors = require('cors')
var bodyParser = require('body-parser');
const {connection} = require('./db/mysql-connect.js');
const { check_overlap_timings } = require('./checking-overlap-timings.js');
const { get_participants } = require('./get-participants.js');

var app = express();


const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(bodyParser.json());

//getting list of participants
app.get('/participants',(req,res)=>{
    var participants = [];
    connection.query("select * from participants",(err, row, field)=>{
        //row is the object containing query result
        //participants in an array containing query result
        if(err)
            throw error;
        for(i in row)
            participants.push(row[i]);
        res.send(participants);
    });
});

//getting list of participants with time
app.get('/participantsTime',(req,res)=>{
    
});

//checking if time overlaps with existing interviews
app.post('/check', function (req, res) {

    var selectedParticipants = req.body.id;
    var time = req.body.time;
    for(var i=0;i<selectedParticipants.length;i++){
        var sql = `select * 
                    from interview it 
                    inner join timings t on it.interview_id = t.interview_id and 
                    par_id = ${selectedParticipants[i]}` 
        connection.query(sql,(err,row,fields)=>{

        });
    }
    res.end( JSON.stringify(req.body));
 })

app.get('/view',(req,res)=>{
    var participants = [];
    connection.query("select * from participants",(err, row, field)=>{
        //row is the object containing query result
        //participants in an array containing query result
        if(err)
            throw error;
        for(i in row)
            participants.push(row[i]);
        // console.log(row);
        res.send(participants);
    });
});





app.get('/create',(req, res)=>{
    // var participants = [];
    // get_participants(participants)
    // console.log(participants);
    // connection.query("select * from participants",(err, row, field)=>{
    //     //row is the object containing query result
    //     //participants in an array containing query result
    //     if(err)
    //         throw error;
    //     for(i in row)
    //         participants.push(row[i]);
    //     res.send(participants);
    // });
    // res.send(participants);
    // console.log(JSON.stringify(participants));
    // results = ["vivek","himanshu"];
    // return res.

    //pushing the list to frontend only the first_names and last_names
    // res.send(participants);


    //getting the list of names selected from the frontend
    //let the name of the array is selected_participants with start_time and end_time and date
    // var selected_participants = [{"par_id":1,"first_name":"Vivek","last_name":"Bansal","experience":0,"contact":"9988776655","email_id":"abc@gmail.com","start_time":"11:30:00","end_time":"12:30:00","date":"2020-02-22"}, {"par_id":2,"first_name":"Ishan","last_name":"Kaushal","experience":0,"contact":"9856455855","email_id":"def@gmail.com","start_time":"15:30:00","end_time":"16:30:00","date":"2020-02-22"}];
    // check_overlap_timings(selected_participants);

    
});

app.get('/',(req,res) =>{
    // connection.query("select * from participants", function (err, rows) {
    //     if (err) throw err;
    //     console.log("Result: " + JSON.stringify(rows));
    //   });
    // res.send("created");
});

app.listen(3000,()=>{
    console.log("app is up on port 3000");
});

