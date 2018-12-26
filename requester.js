// TODO:: server url 에 맞게 수정
var io = require('socket.io-client')('http://3.17.150.19:3000');

if(!process.argv[2]){
    console.log('argument error');
}

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

var json_hash = process.argv[2];

io.emit("ipfsSetup", json_hash);

io.on('offloadingResult', function (data) {
    // log 남기기
    if(json_hash === data.index){
        console.log(getDateTime() + " \tjson index: " + data.index + "\thostname: " + data.userId);
    }
});