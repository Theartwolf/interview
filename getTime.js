getTime = ()=>{
    
    var date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    var date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    var year = date_ob.getFullYear();

    // current hours
    var hours = date_ob.getHours();

    // current minutes
    var minutes = ("0" + (date_ob.getMinutes() + 1)).slice(-2);

    // current seconds
    var seconds = date_ob.getSeconds();
    return time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}

module.exports = {
    getTime
}