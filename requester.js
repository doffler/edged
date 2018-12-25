// TODO:: server url 에 맞게 수정
var io = require('socket.io-client')('http://3.17.150.19:3000');

if(!process.argv[2]){
    console.log('argument error');
}

var json_hash = process.argv[2];

io.emit("ipfsSetup", json_hash);

io.on('offloadingResult', function (data) {
    // TODO:: 결과 받아서 해야할 액션 정의
    console.log(data);
});