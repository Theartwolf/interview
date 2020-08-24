const {connection} = require('./db/mysql-connect.js');

check_overlap_timings = (selected_participants)=>{

    var act_sel_part = [];
    var x = 0;

    for(var i=0;i<selected_participants.length;i++)
    {
        var sql = `select t.date,it.par_id,t.start_time, t.end_time
                    from interviews it inner join timings t 
                    where t.date = ${selected_participants[x].date}  and
                    it.par_id = ${selected_participants[x].par_id} and 
                     it.interview_id = t.interview_id;
                    `;
        connection.query(sql, (err,row,field)=>{
            //case when interview at midnight 23:00 to 01:00
            if(row.length > 0){
                // if selected timings overlap throw error
                var known_start_time = row[0].start_time;
                var known_end_time = row[0].end_time;
                var selected_start_time = selected_participants[x].start_time;
                var selected_end_time = selected_participants[x].end_time;
                if(selected_start_time >= selected_end_time){
                    //throw error
                    console.log("not push");
                }else if(selected_start_time < known_start_time && known_start_time < selected_end_time && selected_end_time <= known_end_time){
                    // throw error
                    console.log("not push");
                } else if(known_start_time <= selected_start_time && selected_start_time < selected_end_time  && selected_end_time <= known_end_time) {
                    //throw error
                    console.log("not push");
                } else if(known_start_time <= selected_start_time && selected_start_time < known_end_time && known_end_time <= selected_end_time){
                    //throw error
                    console.log("not push");
                } else {
                    console.log("push");
                }
                x++;
            } else {
                //this participant is not having any interviews
                console.log("not available");
            }
        });
        // console.log(act_sel_part);
    }
};

module.exports = {
    check_overlap_timings
}



