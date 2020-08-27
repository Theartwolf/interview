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
            inner join interviews iv on p.par_id = iv.par_id 
            inner join timings t on t.time_id = iv.interview_id
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
app.post('/create', (req, res)=> {

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
    var overlapQuery = `select * from
                interviews iv inner join timings t on iv.interview_id = t.time_id
                where par_id in (${string_par_id}) and
                (t.start_time between '${time[0]}' and '${time[1]}'
                or t.end_time between '${time[0]}' and '${time[1]}');`
    
    connection.query(overlapQuery,(err,row)=>{
        if(row.length > 0){
            var par_id = row[0].par_id;
            var q = `select * from participants where participants.par_id = ${par_id}`;
            connection.query(q,(err,result)=>{
                // console.log("NOT AVAILABLE");
                // return ;
                return res.send({message:`${result[0].first_name} not available`});
            });
        } else {
            
            var tm = {
                start_time: time[0],
                end_time: time[1]
            }
             //check for time already exists
             existingTimeQuery =  `select * from timings where start_time = '${time[0]}'
                                     and end_time = '${time[1]}'`;
            connection.query(existingTimeQuery,(err,existingTimeResult)=>{
                if(existingTimeResult.length > 0){

                    var onlyId = [];
                    for(i in selectedParticipants){
                        onlyId.push([selectedParticipants[i].par_id,existingTimeResult[0].time_id]);
                    }

                    connection.query("INSERT INTO interviews(par_id, interview_id) VALUES ?",[onlyId],(err,rows)=>{
                        console.log("SCHEDULED already time");
                        return res.send({message: "Interview Scheduled"});
                    });

                } else {
                    var interview_id_new;
                    // if we didn't find any overlap
                    // insert the into timings table with auto_increment interview_id
                    connection.query('INSERT INTO timings SET ?', tm,(err,row)=>{
                        // console.log("ROW",row);
                        interview_id_new = row.insertId;
                        var onlyId = [];
                        for(i in selectedParticipants){
                            onlyId.push([selectedParticipants[i].par_id,interview_id_new]);
                        }

                        connection.query("INSERT INTO interviews(par_id, interview_id) VALUES ?",[onlyId],(err,rows)=>{
                            console.log("SCHEDULED new time");
                            return res.send({message: "Interview Scheduled"});
                        });
                    });
                }
            });
        }
    });
});

app.post('/edit',(req,res)=>{

    //prev[0].id, prev[0].startTime, prev[0].endTime
    var prevTime = req.body.prevTime;

    //newTime = [startTime, endTime]
    var newTime = req.body.newTime;


    sql = `select * from interviews iv 
            inner join timings t on t.time_id = iv.interview_id
            where iv.par_id = ${prevTime[0].id} and
             t.start_time = '${prevTime[0].startTime}'
             and t.end_time = '${prevTime[0].endTime}';`
    // connection.query(sql,(err,results)=>{
        // console.log("resulrs",results);
        // query = `select * from interviews where par_id = ${results[0].par_id}
        //         and interview_id = ${results[0].interview_id};`
        connection.query(sql,(err,selectrow)=>{
            // if(selectrow.length == 0){
            //     return res.send({message:"Unsuccessful Edit"});
            // }
            // console.log("selectrow",selectrow);
            sqlDelete = `delete from interviews where par_id = ${selectrow[0].par_id}
                    and interview_id = ${selectrow[0].interview_id};`

                connection.query(sqlDelete,(err,delrow)=>{
                    // if(err){
                    //     return res.send({message:"Unsuccessful Edit"});
                    // }
                    var overlapQuery = `select * from
                    interviews iv inner join timings t on iv.interview_id = t.time_id
                    where iv.par_id = ${prevTime[0].id} and
                    (t.start_time between '${newTime[0]}' and '${newTime[1]}'
                    or t.end_time between '${newTime[0]}' and '${newTime[1]}');`
                    
                    // console.log("SSSSSSSss",sqlQ);
                    connection.query(overlapQuery,(err,row)=>{

                        if(row.length == 0){
                            var existingTimeQuery = `select * from timings where start_time = '${newTime[0]}'
                            and end_time = '${newTime[1]}'`
                            connection.query(existingTimeQuery,(err,existingTimeResult)=>{
                                // console.log("RRRR",existingTimeResult);
                                if(existingTimeResult.length == 0){
                                    var insertTimeQuery = `insert into timings(start_time,end_time) values('${newTime[0]}','${newTime[1]}')`
                                    connection.query(insertTimeQuery,(e,insertTimeResult)=>{
                                        console.log("point",insertTimeResult)
                                        var interviewIdQuery = `select * from timings where start_time = '${newTime[0]}'
                                        and end_time = '${newTime[1]}'`
                                        connection.query(interviewIdQuery,(e,interviewIdResult)=>{
                                            var q = `insert into interviews(par_id,interview_id) values(${prevTime[0].id},${interviewIdResult[0].time_id})`
                                            connection.query(q,(e,rrr)=>{
                                                console.log("1");
                                                return res.send({message: "Edit Successful"});
                                            })
                                        });
                                    })
                                    

                                }else {
                                    var q = `insert into interviews(par_id,interview_id) values(${prevTime[0].id},${existingTimeResult[0].interview_id})`
                                    connection.query(q,(e,rr)=>{
                                        console.log("2");
                                        return res.send({message: "Edit Successful"});
                                    });
                                }
                            });
                            
                        } else {
                            var sqlQuery = `insert into interviews(par_id,interview_id) values(${selectrow[0].par_id},${selectrow[0].interview_id})`
                            connection.query(sqlQuery,(err,r)=>{
                                res.send({message:`${prevTime[0].id} not available at that time. Edit unsuccessful`});
                            });
                        }
                    });
            });
        });        
    // });
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

