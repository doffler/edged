// TODO:: server url 에 맞게 수정
var io = require('socket.io-client')('http://3.17.150.19:3000');
var fs = require('fs');

if(!process.argv[2]){
    console.log('argument error');
}

var file_path = process.argv[2];

fs.readFile(file_path, (err, data) => {
   if(err){
       console.log("file read error");
   }
   else{
       io.emit('result', data);
   }
});