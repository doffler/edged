/**
 * File Name : requester.js
 * Executing : node requester.js <index_file>
 */

// NodeJS script code for the offloader side.
//   In this code, offloader is waiting for incoming offloading requests
// broadcasted from socket io server.
//   Upon receiving offloading requests, offloader will download necessary
// files depicted in json file submitted by requester. After constructing
// environment for executing offloading calculation, offloader will run the
// computation and give a result back to requester.
var io = require('socket.io-client')('http://lynx.snu.ac.kr:8000');
var request = require('request');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');

// default json file to store request information
var requestJson = "example.json";
var file_list = [];
var wait_time = 1;

// flags for tracking whether device is ready to execute the command
var flags = {
  jsonFileReadDone : false,
  execFileReadDone : false,
  inputFileReadDone : false,
  paramFileReadDone : false
}

var json_hash = "";
var resultData = "";

//   This function executes offloading computation and return a result back to
// the socket io server to get back to the requester.
function execLogic() {
  if(flags.jsonFileReadDone && flags.execFileReadDone
          && flags.inputFileReadDone && flags.paramFileReadDone){
    console.log("file loading done");
    console.timeEnd('downloading');

    console.time('offloading');
    if(resultData.run_command){
      var childPs = exec(resultData.run_command, function(error,stdout,stderr) {
        if(error){
          console.log(error);
          console.log('failed to execute');
        }
        else{
          console.log("exec success : " + stdout);
          io.emit('result', { userId: os.hostname(), index: json_hash,
              output: stdout });
          console.timeEnd('offloading');
          // reset flags to get new offloading request
          for (var key in flags){
            flags[key] = false;
          }
        }
      });
    }
  }
  else{
    setTimeout(execLogic, 1000);
  }
}

//    This function loads indexed list of file with address given as
// parameters.
function loadFiles(index_list, name_list, key_name) {
  var j = 1;
  for(let idx=0; idx < index_list.length; idx++){
    let index = index_list[idx];
    let name = name_list[idx];
    let content = "";
    let childPs = exec('ipfs get --output ' + name + ' ' + index,
          function(error, stdout, stderr){
      if(error){
        console.log('fail to read ipfs data : ' + name);
      }
      else{
        j++;
        if(j > index_list.length){
          flags[key_name] = true;
        }
      }
    });
  }
}


// Logic to process incoming offloading request
//   1. store offloading request information into json file
//   2. downloading required data files, code files from ipfs server
//   3. construct execution environment for the offloading calculation
io.on('initIpfs', function (data) {
  console.log('Get Request');
  console.time('downloading');
  json_hash = data;

  //   request json file from gateway server provided by ipfs, if gateway server
  // does not respond, request file directly from ipfs
  var childPs = exec('ipfs cat ' + data, function (error, stdout, stderr) {
    if(error){
      console.log('fail to read ipfs data');
    }
    else{
      resultData = JSON.parse(stdout);
      var json_file = fs.createWriteStream(requestJson);
      json_file.write(stdout);
      flags.jsonFileReadDone = true;

      // json parse
      if(resultData.exec_file){
        flags.execFileReadDone = false;
        var exec_index = resultData.exec_file.index;
        var exec_name = resultData.exec_file.file_name;
        loadFiles(exec_index, exec_name, 'execFileReadDone');
      }
      else{
        flags.execFileReadDone = true;
      }

      // Logic for loading parameter files
      if(resultData.parameters){
        flags.paramFileReadDone = false;
        var parameters = resultData.parameters.index;
        var parameter_name = resultData.parameters.file_name;
        loadFiles(parameters, parameter_name, 'paramFileReadDone');
      }
      else{
        flags.paramFileReadDone = true;
      }

      // Logic for loading input data from IPFS
      if(resultData.input_data){
        inputFileReadDone = false;
        var input_index = resultData.input_data.index;
        var input_name = resultData.input_data.file_name;
        var childPs = exec('ipfs get --output ' + input_name + ' '
                + input_index, function(error,stdout,stderr){
          if(error){
            console.log('fail to read ipfs data');
          }
          else{
                flags.inputFileReadDone = true
          }
        });
      }
      else{
        flags.inputFileReadDone = true;
      }
    }
  });

  // exec logic
  execLogic();
});
