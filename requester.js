/**
 * File Name : requester.js
 * Executing : node requester.js <index_file>
 */

// NodeJS script code for the requester side.
//   In this code, we use lynx.snu.ac.kr server as a center of edge d network,
// which broadcasts incoming offloading requests to edge devices connected to
// the server
var io = require('socket.io-client')('http://lynx.snu.ac.kr:8000');
var fs = require('fs');

//   Invoke error message if user did not specify index(in terms of ipfs) of
// json file, which contains necessary information for executing offloading
// operation
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

console.time('base');

//   Send json_hash value to socket io server to broadcast offloading requests
// to nearby offloaders, edge devices
io.emit("ipfsSetup", json_hash);

//   Receiving offloading result, computation value, from offloaders and record
// it on log directory.
io.on('offloadingResult', function (data) {
  // log 남기기
  if(json_hash === data.index){
    console.log(getDateTime() + " \tjson index: " + data.index + "\thostname "
    + data.userId + '\noutput:' + data.output);
    fs.appendFile("./request_log/log.txt", getDateTime() + ":"
          + data.index + "\t" + data.userId + "\t" + json_hash, function(err){
        if(err) throw err;
  console.timeEnd('base');
  process.exit(0);
    });
  }
});
