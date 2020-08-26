const express = require('express');
const cors = require('cors')
var bodyParser = require('body-parser');
const {connection} = require('./db/mysql-connect.js');
const { check_overlap_timings } = require('./checking-overlap-timings.js');
const { get_participants } = require('./get-participants.js');
const {getTime} = require('./getTime.js');

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
        if(err)
            throw err;
        for(i in row)
            participants.push(row[i]);
        res.send(participants);
    });
});

//getting list of participants with time
app.get('/participantsTime',(req,res)=>{
    var participants = [];

    //timeformat YYY-MM-DD HH:MM:SS
    var time = String(getTime());


    sql = `select p.par_id,p.first_name, p.last_name, t.start_time, t.end_time 
            from participants p
            inner join temp_inter iv on p.par_id = iv.par_id 
            inner join timings t on t.interview_id = iv.interview_id
            and t.start_time > '${time}'`
    connection.query(sql,(err, row, field)=>{
        //row is the object containing query result
        //participants in an array containing query result
        if(err)
            res.send(err);
        for(i in row)
            participants.push(row[i]);
        res.send(participants);
    });
    
});

//checking if time overlaps with existing interviews 
// If time is not overlapping then inserting into DB
app.post('/check', function (req, res) {

    //selectedParticipants = [{par_id,first_name}];
    var selectedParticipants = req.body.id;

    //making the ids into string eg. id1, id2, id3, id4....
    var string_par_id = "";
    for(i in selectedParticipants){
        string_par_id += (String(selectedParticipants[i].par_id)+ ", ");
    }
    string_par_id = string_par_id.slice(0,string_par_id.length-2);

    //if selected participants less than 2 return error
    if(selectedParticipants.length < 2){
        //throw error because atleast 2 candidates are required
        return res.send({message:"Select atleast 2 Participants"}); 
    }

    // time = [start_time,end_time]
    var time = req.body.time;

    //query to check ovelap time for existing par_id 
    var sql = `select * from
                interviews iv inner join timings t on iv.interview_id = t.interview_id
                where par_id in (${string_par_id}) and
                (t.start_time between '${time[0]}' and '${time[1]}'
                or t.end_time between '${time[0]}' and '${time[1]}');`
    
        connection.query(sql,(err,row)=>{
            if(row.length > 0){
                return res.send({message:"Participants not available"});
            }
        });

    var tm = {
        start_time: time[0],
        end_time: time[1]
    }
    var interview_id_new;

    // if we didn't find any overlap
    // insert the into timings table with auto_increment interview_id
    connection.query('INSERT INTO timings SET ?', tm,(err,row,fields)=>{
        // console.log("ROW",row);
        interview_id_new = row.insertId;
        var onlyId = [];
        for(i in selectedParticipants){
            onlyId.push([selectedParticipants[i].par_id,interview_id_new]);
        }

        connection.query("INSERT INTO interviews(par_id, interview_id) VALUES ?",[onlyId],(err,row,fields)=>{

        });
    });
 })

// app.get('/view',(req,res)=>{
    // var participants = [];
    // connection.query("select * from participants",(err, row, field)=>{
        //row is the object containing query result
        //participants in an array containing query result
        // if(err)
            // throw error;
        // for(i in row)
            // participants.push(row[i]);
        // console.log(row);
//         res.send(participants);
//     });
// });

// app.post('/edit',(req,res)=>{
//     var id = req.body.id;
//     var startTime = req.body.startTime;
//     var endTime = req.body.endTime
//     sql = `select * from interviews iv 
//             inner join timings t on t.interview_id = iv.interview_id`
// });


// app.get('/create',(req, res)=>{
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
// });

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

