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
var jsonFileReadDone = false;
var execFileReadDone = false;
var inputFileReadDone = false;
var paramFileReadDone = false;
var json_hash = "";
var resultData = "";

//   function executes the offloading computation and return a result back to
// the socket io server to get back to the requester.
function execLogic() {
  if(jsonFileReadDone && execFileReadDone
      && inputFileReadDone && paramFileReadDone){
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
          jsonFileReadDone = false;
          execFileReadDone = false;
          inputFileReadDone = false;
          paramFileReadDone = false;
        }
      });
    }
  }
  else{
    setTimeout(execLogic, 1000);
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
  var baseUrl = 'https://gateway.ipfs.io/ipfs/';

  var url = baseUrl;
  url = baseUrl + json_hash;

  //   request json file from gateway server provided by ipfs, if gateway server
  // does not respond, request file directly from ipfs
  request({ url: url, timeout: wait_time }, function (error, response, body) {
    resultData = "";
    if(error){
      var childPs = exec('ipfs cat ' + data, function (error, stdout, stderr) {
        if(error){
          console.log('fail to read ipfs data');
        }
        else{
          resultData = JSON.parse(stdout);
          var json_file = fs.createWriteStream(requestJson);
          json_file.write(stdout);
          jsonFileReadDone = true;

          // json parse
          if(resultData.exec_file){
            execFileReadDone = false;
            var exec_index = resultData.exec_file.index;
            var exec_name = resultData.exec_file.file_name;

            // get exec file
            // TODO : exec file can be given in form of directory, we should
            //        seperate the code logic for directory and just file format
            if(resultData.exec_file.isdir){
              var childPs = exec('ipfs get --output ' + exec_name + " " + exec_index,
                  function(error,stdout,stderr){
                    if(error){
                      console.log('fail to read ipfs directory');
                    }
                    else{
                      console.log('exec_file successfully loaded');
                      execFileReadDone = true;
                      file_list.push(exec_name);
                    }
                  });
            }
            else{
              var j = 1;
              for(let idx = 0; idx < exec_index.length; idx++){
                let execUrl = baseUrl + exec_index[idx];
                let ex_index = exec_index[idx];
                let ex_name = exec_name[idx];
                request({ url: execUrl, timeout: wait_time }, function(error,response,body){
                  let execContent = "";
                  if(error){
                    let childPs = exec('ipfs cat ' + ex_index, function (error, stdout, stderr) {
                      if(error){
                        console.log('fail to read ipfs data');
                      }
                      else{
                        console.log(ex_index);
                        execContent = stdout;
                        let exec_file = fs.createWriteStream(ex_name);
                        exec_file.write(execContent);
                        file_list.push(ex_name);
                        j++;
                      }
                    });
                  }
                  else{
                    execContent = body;
                    let exec_file = fs.createWriteStream(exec_name[idx]);
                    exec_file.write(execContent);
                    file_list.push(exec_name[idx]);
                    j++;
                  }
                });
              }
              if(j > exec_index.length)
                console.log("done");
                execFileReadDone = true;
            }
          }
          else{
            execFileReadDone = true;
          }
          if(resultData.parameters){
            paramFileReadDone = false;
            var parameters = resultData.parameters.index;
            var parameter_name = resultData.parameters.file_name;

            // get parameters file
            // TODO : multiple parameter files can be given
            //        separate code to process multiple paramter files.
            //        In this case, paramter index, name will be given in
            //        list form in the json file
            //        Also, it can be given as a directory index. In this
            //        case, index hash for directory and name of the directory
            //        will be given
            if(resultData.parameters.isdir){
              var childPs = exec('ipfs get --output ' + parameter_name
                  + " " + parameters, function(error,stdout,stderr){
                if(error){
                  console.log('fail to read parameter data');
                }
                else{
                  console.log('parameter data successfully loaded');
                  paramFileReadDone = true;
                  file_list.push(parameter_name);
                }
              });
            }
            else{
              if(Array.isArray(parameters)){
                console.log(parameters);
                for(let i=0;i<parameters.length;i++){
                  paramFileReadDone = false;
                  let paramUrl = baseUrl + parameters[i];
                  request({ url: paramUrl, timeout: wait_time }, function(error,response,body){
                    let paramContent = "";
                    if(error){
                      let childPs = exec('ipfs get --output ' + parameter_name[i]
                            + ' ' + parameters[i], function(error,stdout,stderr){
                        if(error){
                          console.log('fail to read parameter data');
                        }
                        else{
                          paramFileReadDone = true;
                          console.log('parameter data successfully loaded');
                        }
                      });
                    }
                    else{
                      paramContent = body;
                      let parameter_file = fs.createWriteStream(parameter_name[i]);
                      parameter_file.write(paramContent);
                      paramFileReadDone = true;
                      file_list.push(parameter_name[i]);
                    }
                  });
                }
              }
              else{
                var paramUrl = baseUrl + parameters;
                request({ url: paramUrl, timeout: wait_time }, function(error,response,body){
                  var paramContent = "";
                  if(error){
                    var childPs = exec('ipfs cat ' + parameters, function(error,stdout,stderr){
                      if(error){
                        console.log('fail to read parameter data');
                      }
                      else{
                        paramContent = stdout;
                        var parameter_file = fs.createWriteStream(parameter_name);
                        parameter_file.write(paramContent);
                        paramFileReadDone = true;
                        console.log('parameter data successfully loaded')
                      }
                    });
                  }
                  else{
                    paramContent = body;
                    var parameter_file = fs.createWriteStream(parameter_file);
                    parameter_file.write(paramContent);
                    paramFileReadDone = true;
                    file_list.push(parameter_file);
                  }
                });
              }
            }
          }
          else{
            paramFileReadDone = true;
          }

          if(resultData.input_data){
            inputFileReadDone = false;
            var input_index = resultData.input_data.index;
            var input_name = resultData.input_data.file_name;

            // get exec file
            var inputUrl = baseUrl + input_index;
            request({ url: inputUrl, timeout: wait_time }, function(error,response,body){
              var inputContent = "";
              if(error){
                var childPs = exec('ipfs get --output ' + input_name + ' '
                    + input_index, function(error,stdout,stderr){
                  if(error){
                    console.log('fail to read ipfs data');
                  }
                  else{
                    inputFileReadDone = true
                  }
                });
              }
              else{
                inputContent = body;
                var input_file = fs.createWriteStream(input_name);
                input_file.write(inputContent);
                inputFileReadDone = true;
                file_list.push(input_file);
              }
            });
          }
          else{
            inputFileReadDone = true;
          }
        }
      });
    }
    else{
      resultData = JSON.parse(body);
      var file = fs.createWriteStream('example.json');
      file.write(body);

      jsonFileReadDone = true;

      // json parse
      if(resultData.exec_file){
        execFileReadDone = false;
        var index = resultData.exec_file.index;
        var exec_name = resultData.exec_file.file_name;

        // get exec file
        var execUrl = baseUrl + index;
        request({ url: execUrl, timeout: wait_time }, function(error,response,body){
          var execContent = "";
          if(error){
            var childPs = exec('ipfs cat ' + index, function(error,stdout,stderr){
              if(error){
                console.log('fail to read ipfs data');
              }
              else{
                execContent = stdout;
                var file = fs.createWriteStream(exec_name);
                file.write(execContent);
                execFileReadDone = true;
              }
            });
          }
          else{
            execContent = body;
            var file = fs.createWriteStream(exec_name);
            file.write(execContent);
            execFileReadDone = true;
          }
        });
      }

      if(resultData.parameters){
        parameter_file = false;
        var parameters = resultData.exec_file.parameters;
        var parameter_file = resultData.exec_file.parameter_file;

        // get parameters file
        var paramUrl = baseUrl + parameters;
        request({ url: paramUrl, timeout: wait_time }, function(error,response,body){
          var paramContent = "";
          if(error){
            var childPs = exec('ipfs cat ' + parameters, function(error,stdout,stderr){
              if(error){
                console.log('fail to read ipfs data');
              }
              else{
                paramContent = stdout;
                var file = fs.createWriteStream(parameter_file);
                file.write(paramContent);
                paramFileReadDone = true;
              }
            });
          }
          else{
            paramContent = body;
            var file = fs.createWriteStream(parameter_file);
            file.write(paramContent);
            paramFileReadDone = true;
          }
        });
      }
      else{
        paramFileReadDone = true;
      }
    }

    if(resultData.input_data){
      inputFileReadDone = false;
      var index = resultData.input_data.index;
      var input_name = resultData.input_data.file_name;

      // get exec file
      var inputUrl = baseUrl + index;
      request({ url: inputUrl, timeout: wait_time }, function(error,response,body){
        var inputContent = "";
        if(error){
          var childPs = exec('ipfs cat ' + index, function(error,stdout,stderr){
            if(error){
              console.log('fail to read ipfs data');
            }
            else{
              inputContent = stdout;
              var file = fs.createWriteStream(input_name);
              file.write(inputContent);
              inputFileReadDone = true;
            }
          });
        }
        else{
          inputContent = body;
          var file = fs.createWriteStream(input_name);
          file.write(inputContent);
          inputFileReadDone = true;
        }
      });
    }
    else{
      inputFileReadDone = true;
    }

    // exec logic
    execLogic();
  });
});
