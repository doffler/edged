// 필요한 require 정의
// io: socket io client api
// os: local 정보를 가져오기 위한 api
var io = require('socket.io-client')('http://3.17.150.19:3000');
var os = require('os');

// argument check
// 실행을 위한 정보가 담긴 json file의 ipfs hash index 값
if(!process.argv[2]){
    console.log('argument error');
}

// 현재 시간을 가져오는 function
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

// login 기록을 server에 추가
io.emit("login", {
    userid: os.hostname(),
});

// server에 json hash index를 전송
io.emit("ipfsSetup", json_hash);

// offloader의 결과를 전송 받아서 log 생성
io.on('offloadingResult', function (data) {
    // 자신이 요청한 결과인지를 check
    if(json_hash === data.index){
        console.log(getDateTime() + " \tjson index: " + data.index + "\thostname: " + data.userId);
    }
});