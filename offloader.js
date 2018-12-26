// TODO:: server url 에 맞게 수정
var io = require('socket.io-client')('http://3.17.150.19:3000');
var request = require('request');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');

var jsonFileReadDone = false;
var execFileReadDone = true;
var inputFileReadDone = true;
var paramFileReadDone = true;
var json_hash = "";

function execLogic(data) {
    if(jsonFileReadDone && execFileReadDone && inputFileReadDone && paramFileReadDone){
        // TODO:: logic
        console.log("file loading done");

        if(data.run_command){
            var childPs = exec(data.run_command, function (error, stdout, stderr) {
                if(error){
                    console.log('fail to execution data');
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

/////////////// test code
var baseUrl = 'https://gateway.ipfs.io/ipfs/';
var data = 'QmcHyLxkALwyNDwPFaZwn6s7dLKaFUkaY8C9a9Pf3U23zQ';

var url = baseUrl;
url = baseUrl + data;

request({ url: url, timeout: 5000 }, function (error, response, body) {
    var resultData = "";
    if(error){
        var childPs = exec('ipfs cat ' + data, function (error, stdout, stderr) {
            if(error){
                console.log('fail to read ipfs data');
            }
            else{
                resultData = JSON.parse(stdout);
                var file = fs.createWriteStream('example.json');
                file.write(stdout);
                jsonFileReadDone = true;

                // json parse
                if(resultData.exec_file){
                    execFileReadDone = false;
                    var index = resultData.exec_file.index;
                    var file_name = resultData.exec_file.file_name;

                    // get exec file
                    var execUrl = baseUrl + index;
                    request({ url: execUrl, timeout: 5000 }, function (error, response, body) {
                        var execContent = "";
                        if(error){
                            var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                                if(error){
                                    console.log('fail to read ipfs data');
                                }
                                else{
                                    execContent = stdout;
                                    var file = fs.createWriteStream(file_name);
                                    file.write(execContent);
                                    execFileReadDone = true;
                                }
                            });
                        }
                        else{
                            execContent = body;
                            var file = fs.createWriteStream(file_name);
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
                        request({ url: paramUrl, timeout: 5000 }, function (error, response, body) {
                            var paramContent = "";
                            if(error){
                                var childPs = exec('ipfs cat ' + parameters, function (error, stdout, stderr) {
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
                }

                if(resultData.input_data){
                    inputFileReadDone = false;
                    var index = resultData.input_data.index;
                    var file_name = resultData.input_data.file_name;

                    // get exec file
                    var inputUrl = baseUrl + index;
                    request({ url: inputUrl, timeout: 5000 }, function (error, response, body) {
                        var inputContent = "";
                        if(error){
                            var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                                if(error){
                                    console.log('fail to read ipfs data');
                                }
                                else{
                                    inputContent = stdout;
                                    var file = fs.createWriteStream(file_name);
                                    file.write(inputContent);
                                    inputFileReadDone = true;
                                }
                            });
                        }
                        else{
                            inputContent = body;
                            var file = fs.createWriteStream(file_name);
                            file.write(inputContent);
                            inputFileReadDone = true;
                        }
                    });
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
            var file_name = resultData.exec_file.file_name;

            // get exec file
            var execUrl = baseUrl + index;
            request({ url: execUrl, timeout: 5000 }, function (error, response, body) {
                var execContent = "";
                if(error){
                    var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                        if(error){
                            console.log('fail to read ipfs data');
                        }
                        else{
                            execContent = stdout;
                            var file = fs.createWriteStream(file_name);
                            file.write(execContent);
                            execFileReadDone = true;
                        }
                    });
                }
                else{
                    execContent = body;
                    var file = fs.createWriteStream(file_name);
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
                request({ url: paramUrl, timeout: 5000 }, function (error, response, body) {
                    var paramContent = "";
                    if(error){
                        var childPs = exec('ipfs cat ' + parameters, function (error, stdout, stderr) {
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
        }

        if(resultData.input_data){
            inputFileReadDone = false;
            var index = resultData.input_data.index;
            var file_name = resultData.input_data.file_name;

            // get exec file
            var inputUrl = baseUrl + index;
            request({ url: inputUrl, timeout: 5000 }, function (error, response, body) {
                var inputContent = "";
                if(error){
                    var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                        if(error){
                            console.log('fail to read ipfs data');
                        }
                        else{
                            inputContent = stdout;
                            var file = fs.createWriteStream(file_name);
                            file.write(inputContent);
                            inputFileReadDone = true;
                        }
                    });
                }
                else{
                    inputContent = body;
                    var file = fs.createWriteStream(file_name);
                    file.write(inputContent);
                    inputFileReadDone = true;
                }
            });
        }
    }

    // exec logic
    execLogic(resultData);
});
//////////////////////

io.on('initIpfs', function (data) {
   json_hash = data;
   var baseUrl = 'https://gateway.ipfs.io/ipfs/';

    var url = baseUrl;
    url = baseUrl + json_hash;

    request({ url: url, timeout: 5000 }, function (error, response, body) {
        var resultData = "";
        if(error){
            var childPs = exec('ipfs cat ' + data, function (error, stdout, stderr) {
                if(error){
                    console.log('fail to read ipfs data');
                }
                else{
                    resultData = JSON.parse(stdout);
                    var file = fs.createWriteStream('example.json');
                    file.write(stdout);
                    jsonFileReadDone = true;

                    // json parse
                    if(resultData.exec_file){
                        execFileReadDone = false;
                        var index = resultData.exec_file.index;
                        var file_name = resultData.exec_file.file_name;

                        // get exec file
                        var execUrl = baseUrl + index;
                        request({ url: execUrl, timeout: 5000 }, function (error, response, body) {
                            var execContent = "";
                            if(error){
                                var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                                    if(error){
                                        console.log('fail to read ipfs data');
                                    }
                                    else{
                                        execContent = stdout;
                                        var file = fs.createWriteStream(file_name);
                                        file.write(execContent);
                                        execFileReadDone = true;
                                    }
                                });
                            }
                            else{
                                execContent = body;
                                var file = fs.createWriteStream(file_name);
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
                            request({ url: paramUrl, timeout: 5000 }, function (error, response, body) {
                                var paramContent = "";
                                if(error){
                                    var childPs = exec('ipfs cat ' + parameters, function (error, stdout, stderr) {
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
                    }

                    if(resultData.input_data){
                        inputFileReadDone = false;
                        var index = resultData.input_data.index;
                        var file_name = resultData.input_data.file_name;

                        // get exec file
                        var inputUrl = baseUrl + index;
                        request({ url: inputUrl, timeout: 5000 }, function (error, response, body) {
                            var inputContent = "";
                            if(error){
                                var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                                    if(error){
                                        console.log('fail to read ipfs data');
                                    }
                                    else{
                                        inputContent = stdout;
                                        var file = fs.createWriteStream(file_name);
                                        file.write(inputContent);
                                        inputFileReadDone = true;
                                    }
                                });
                            }
                            else{
                                inputContent = body;
                                var file = fs.createWriteStream(file_name);
                                file.write(inputContent);
                                inputFileReadDone = true;
                            }
                        });
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
                var file_name = resultData.exec_file.file_name;

                // get exec file
                var execUrl = baseUrl + index;
                request({ url: execUrl, timeout: 5000 }, function (error, response, body) {
                    var execContent = "";
                    if(error){
                        var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                            if(error){
                                console.log('fail to read ipfs data');
                            }
                            else{
                                execContent = stdout;
                                var file = fs.createWriteStream(file_name);
                                file.write(execContent);
                                execFileReadDone = true;
                            }
                        });
                    }
                    else{
                        execContent = body;
                        var file = fs.createWriteStream(file_name);
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
                    request({ url: paramUrl, timeout: 5000 }, function (error, response, body) {
                        var paramContent = "";
                        if(error){
                            var childPs = exec('ipfs cat ' + parameters, function (error, stdout, stderr) {
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
            }

            if(resultData.input_data){
                inputFileReadDone = false;
                var index = resultData.input_data.index;
                var file_name = resultData.input_data.file_name;

                // get exec file
                var inputUrl = baseUrl + index;
                request({ url: inputUrl, timeout: 5000 }, function (error, response, body) {
                    var inputContent = "";
                    if(error){
                        var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                            if(error){
                                console.log('fail to read ipfs data');
                            }
                            else{
                                inputContent = stdout;
                                var file = fs.createWriteStream(file_name);
                                file.write(inputContent);
                                inputFileReadDone = true;
                            }
                        });
                    }
                    else{
                        inputContent = body;
                        var file = fs.createWriteStream(file_name);
                        file.write(inputContent);
                        inputFileReadDone = true;
                    }
                });
            }
        }

        // exec logic
        execLogic(resultData);
    });
});