// Socke IO server to transfer offloading requests and results
// Default Setting : 3.17.150.19:3000
var io = require('socket.io-client')('http://3.17.150.19:3000');
var request = require('request');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');

// default json file to get request information
var requestJson = "example.json";
var file_list = [];

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

io.on('initIpfs', function (data) {
  json_hash = data;
  var baseUrl = 'https://gateway.ipfs.io/ipfs/';

  var url = baseUrl;
  url = baseUrl + json_hash;
  console.log("start : " + data);

  request({ url: url, timeout: 1000 }, function (error, response, body) {
    resultData = "";
    if(error){
      var childPs = exec('ipfs cat ' + data, function (error, stdout, stderr) {
        if(error){
          console.log('fail to read ipfs data : json file');
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
              var execUrl = baseUrl + exec_index;
              request({ url: execUrl, timeout: 1000 }, function(error,response,body){
                var execContent = "";
                if(error){
                  var childPs = exec('ipfs cat ' + exec_index,
                      function (error, stdout, stderr) {
                        if(error){
                          console.log('fail to read ipfs data : exec file');
                        }
                        else{
                          execContent = stdout;
                          var exec_file = fs.createWriteStream(exec_name);
                          exec_file.write(execContent);
                          execFileReadDone = true;
                          file_list.push(exec_name);
                        }
                      });
                }
                else{
                  execContent = body;
                  var exec_file = fs.createWriteStream(exec_name);
                  exec_file.write(execContent);
                  execFileReadDone = true;
                  file_list.push(exec_name);
                }
              });
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
                  for(var i=0;i<parameters.length;i++){
                    paramFileReadDone = false;
                    var paramUrl = baseUrl + parameters[i];
                    request({ url: paramUrl, timeout: 1000 }, function(error,response,body){
                      var paramContent = "";
                      if(error){
                        var childPs = exec('ipfs cat ' + parameters[i], function(error,stdout,stderr){
                          if(error){
                            console.log('fail to read parameter data');
                          }
                          else{
                            paramContent = stdout;
                            var parameter_file = fs.createWriteStream(parameter_name[i]);
                            parameter_file.write(paramContent);
                            paramFileReadDone = true;
                            console.log('parameter data successfully loaded');
                            file_list.push(parameter_name[i])
                          }
                        });
                      }
                      else{
                        paramContent = body;
                        var parameter_file = fs.createWriteStream(parameter_name[i]);
                        parameter_file.write(paramContent);
                        paramFileReadDone = true;
                        file_list.push(parameter_name[i]);
                      }
                    });
                  }
                }
                else{
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
                      file_list.push(parameter_file);
                    }
                  });
                }
              }
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
                    console.log('fail to read ipfs data : input data');
                  }
                  else{
                    inputContent = stdout;
                    var input_file = fs.createWriteStream(input_name);
                    input_file.write(inputContent);
                    inputFileReadDone = true;
                    console.log('input data successfully loaded');
                    file_list.push(input_file);
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
      var file = fs.createWriteStream(requestJson);
      file.write(body);

      jsonFileReadDone = true;

      // json parse
      if(resultData.exec_file){
        execFileReadDone = false;
        var exec_index = resultData.exec_file.index;
        var exec_name = resultData.exec_file.file_name;
        console.log(exec_name);

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
          var execUrl = baseUrl + exec_index;
          request({ url: execUrl, timeout: 1000 }, function(error,response,body){
            var execContent = "";
            if(error){
              var childPs = exec('ipfs cat ' + index,
                  function (error, stdout, stderr) {
                    if(error){
                      console.log('fail to read ipfs data : exec file');
                    }
                    else{
                      execContent = stdout;
                      var exec_file = fs.createWriteStream(exec_name);
                      exec_file.write(execContent);
                      execFileReadDone = true;
                      file_list.push(exec_name);
                    }
                  });
            }
            else{
              execContent = body;
              var exec_file = fs.createWriteStream(exec_name);
              exec_file.write(execContent);
              execFileReadDone = true;
              file_list.push(exec_name);
            }
          });
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
              for(var i=0;i<parameters.length;i++){
                paramFileReadDone = false;
                var paramUrl = baseUrl + parameters[i];
                request({ url: paramUrl, timeout: 1000 }, function(error,response,body){
                  var paramContent = "";
                  if(error){
                    var childPs = exec('ipfs cat ' + parameters[i], function(error,stdout,stderr){
                      if(error){
                        console.log('fail to read parameter data');
                      }
                      else{
                        paramContent = stdout;
                        var parameter_file = fs.createWriteStream(parameter_name[i]);
                        parameter_file.write(paramContent);
                        paramFileReadDone = true;
                        console.log('parameter data successfully loaded');
                        file_list.push(parameter_name[i])
                      }
                    });
                  }
                  else{
                    paramContent = body;
                    var parameter_file = fs.createWriteStream(parameter_name[i]);
                    parameter_file.write(paramContent);
                    paramFileReadDone = true;
                    file_list.push(parameter_name[i]);
                  }
                });
              }
            }
            else{
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
                  file_list.push(parameter_file);
                }
              });
            }
          }
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
                console.log('fail to read ipfs data : input data');
              }
              else{
                inputContent = stdout;
                var input_file = fs.createWriteStream(input_name);
                input_file.write(inputContent);
                inputFileReadDone = true;
                console.log('input data successfully loaded');
                file_list.push(input_file);
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

    // exec logic
    execLogic();
  });
});
