// Socke IO server to transfer offloading requests and results
// Default Setting : 3.17.150.19:3000
var io = require('socket.io-client')('http://3.17.150.19:3000');
var request = require('request');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');

// default json file to get request information
var requestJson = "example.json";

var jsonFileReadDone = false;
var execFileReadDone = false;
var inputFileReadDone = false;
var paramFileReadDone = false;
var json_hash = "";
var resultData = "";

function execLogic() {
  if(jsonFileReadDone && execFileReadDone
      && inputFileReadDone && paramFileReadDone){
    console.log("file loading done");

    if(resultData.run_command){
      var childPs = exec(resultData.run_command, function(error,stdout,stderr) {
        if(error){
          console.log(error);
          console.log('failed to execute');
        }
        else{
          console.log("exec success : " + stdout);
          io.emit('result', { userId: os.hostname(), index: json_hash });
        }
      });
    }
  }
  else{
    setTimeout(execLogic, 1000);
  }
}

io.on('initIpfs', function (data) {
  json_hash = data;
  var baseUrl = 'https://gateway.ipfs.io/ipfs/';

  var url = baseUrl;
  url = baseUrl + json_hash;

  request({ url: url, timeout: 1000 }, function (error, response, body) {
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
            console.log(exec_name);

            // get exec file
            var execUrl = baseUrl + exec_index;
            request({ url: execUrl, timeout: 1000 }, function(error,response,body){
              var execContent = "";
              if(error){
                var childPs = exec('ipfs get --output ' + exec_name + " " + exec_index,
                      function(error,stdout,stderr){
                  if(error){
                    console.log('fail to read ipfs directory');
                  }
                  else{
                    console.log('exec_file successfully loaded');
                    execFileReadDone = true;
                  }
                });
                // else{
                //   var childPs = exec('ipfs cat ' + index,
                //         function (error, stdout, stderr) {
                //     if(error){
                //       console.log('fail to read ipfs data');
                //     }
                //     else{
                //       execContent = stdout;
                //       var file = fs.createWriteStream(file_name);
                //       file.write(execContent);
                //       execFileReadDone = true;
                //     }
                //   });
              }
              else{
                execContent = body;
                var exec_file = fs.createWriteStream(exec_name);
                exec_file.write(execContent);
                execFileReadDone = true;
              }
            });

            if(resultData.parameters){
              parameter_file = false;
              var parameters = resultData.parameters.index;
              var parameter_name = resultData.parameters.file_name;

              // get parameters file
              var paramUrl = baseUrl + parameters;
              request({ url: paramUrl, timeout: 1000 }, function(error,response,body){
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
                }
              });
            }
            else{
              paramFileReadDone = true;
            }
          }
          else{
            execFileReadDone = true;
            paramFileReadDone = true;
          }

          if(resultData.input_data){
            inputFileReadDone = false;
            var input_index = resultData.input_data.index;
            var input_name = resultData.input_data.file_name;
            console.log(input_name);

            // get exec file
            var inputUrl = baseUrl + input_index;
            request({ url: inputUrl, timeout: 1000 }, function(error,response,body){
              var inputContent = "";
              if(error){
                var childPs = exec('ipfs cat ' + input_index, function(error,stdout,stderr){
                  if(error){
                    console.log('fail to read ipfs data');
                  }
                  else{
                    inputContent = stdout;
                    var input_file = fs.createWriteStream(input_name);
                    input_file.write(inputContent);
                    inputFileReadDone = true;
                    console.log('input data successfully loaded');
                  }
                });
              }
              else{
                inputContent = body;
                var input_file = fs.createWriteStream(input_name);
                input_file.write(inputContent);
                inputFileReadDone = true;
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
        request({ url: execUrl, timeout: 1000 }, function(error,response,body){
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

        if(resultData.parameters){
          parameter_file = false;
          var parameters = resultData.exec_file.parameters;
          var parameter_file = resultData.exec_file.parameter_file;

          // get parameters file
          var paramUrl = baseUrl + parameters;
          request({ url: paramUrl, timeout: 1000 }, function(error,response,body){
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
      else{
        execFileReadDone = true;
        paramFileReadDone = true;
      }

      if(resultData.input_data){
        inputFileReadDone = false;
        var index = resultData.input_data.index;
        var input_name = resultData.input_data.file_name;

                // get exec file
        var inputUrl = baseUrl + index;
        request({ url: inputUrl, timeout: 1000 }, function(error,response,body){
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
    }

    // exec logic
    execLogic();
  });

  // fs.unlink(requestJson, function(err){
  //   if(err)
  //     throw err;
  // });
  //
  // for(var i=0; i < file_list.length; i++){
  //   fs.unlink(file_list[i], function(err){
  //     if(err)
  //       throw err;
  //   });
  // }
});
