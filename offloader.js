// socket io client connect
// 필요한 require 정의
// io: socket io client api
// request: url call을 위한 api
// exec: cli 실행을 위한 api
// fs: file stream api
// os: local 정보를 가져오기 위한 api
var io = require('socket.io-client')('http://3.17.150.19:3000');
var request = require('request');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');

// 모든 file 로딩 확인을 위한 boolean variable
var jsonFileReadDone = false;
var execFileReadDone = false;
var inputFileReadDone = false;
var paramFileReadDone = false;
// input & output data variable
var json_hash = "";
var resultData = "";

// input 로딩이 끝난 후 로직 실행
function execLogic() {
    if(jsonFileReadDone && execFileReadDone && inputFileReadDone && paramFileReadDone){
        console.log("file loading done");

        // input json 파일의 run_command 실행
        if(resultData.run_command){
            var childPs = exec(resultData.run_command, function (error, stdout, stderr) {
                if(error){
                    console.log('fail to execution data');
                }
                else{
                    console.log("exec success : " + stdout);

                    // 결과 및 사용자 정보 서버에 전송
                    // TODO:: 결과 파일 전송 추가
                    io.emit('result', { userId: os.hostname(), index: json_hash });
                }
            });
        }
    }
    else{
        // file loading이 안끝났으면 1초 주기로 재실행
        setTimeout(execLogic, 1000);
    }
}

// login 기록을 server에 추가
io.emit("login", {
    userid: os.hostname(),
});

// requester 가 보낸 연산 요청을 수행
io.on('initIpfs', function (data) {
   json_hash = data;
   // ipfs에 업로드된 data를 가져오기 위한 url
   var baseUrl = 'https://gateway.ipfs.io/ipfs/';

    var url = baseUrl;
    // requester가 보낸 json hash index를 baseUrl에 추가
    url = baseUrl + json_hash;

    // gateway.io에서 해당 json 파일을 요청
    request({ url: url, timeout: 5000 }, function (error, response, body) {
        if(error){
            // gateway.io에서 가져오는걸 실패하여 cli 명령으로 ipfs와 통신
            var childPs = exec('ipfs cat ' + data, function (error, stdout, stderr) {
                if(error){
                    console.log('fail to read ipfs data');
                }
                else{
                    // json object 형식으로 output read
                    resultData = JSON.parse(stdout);
                    // json파일을 local에 저장
                    var file = fs.createWriteStream('example.json');
                    file.write(stdout);

                    jsonFileReadDone = true;

                    // json parse
                    // exec_file - index: exec file ipfs hash index, file_name: 저장할 file명
                    //             parameters: parameters file ipfs hash index, parameter_file: 저장할 file명
                    // input_data -  index: input data ipfs hash index, file_name: 저장할 file명
                    // run_command - 실행할 명령어
                    if(resultData.exec_file){
                        execFileReadDone = false;
                        var index = resultData.exec_file.index;
                        var file_name = resultData.exec_file.file_name;

                        // get exec file
                        var execUrl = baseUrl + index;
                        // gateway.io에서 해당 파일을 요청
                        request({ url: execUrl, timeout: 5000 }, function (error, response, body) {
                            var execContent = "";
                            if(error){
                                // gateway.io에서 가져오는걸 실패하여 cli 명령으로 ipfs와 통신
                                var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                                    if(error){
                                        console.log('fail to read ipfs data');
                                    }
                                    else{
                                        execContent = stdout;
                                        // exec 파일을 local에 저장
                                        var file = fs.createWriteStream(file_name);
                                        file.write(execContent);
                                        execFileReadDone = true;
                                    }
                                });
                            }
                            else{
                                execContent = body;
                                // exec 파일을 local에 저장
                                var file = fs.createWriteStream(file_name);
                                file.write(execContent);
                                execFileReadDone = true;
                            }
                        });

                        if(resultData.exec_file.parameters){
                            parameter_file = false;
                            var parameters = resultData.exec_file.parameters;
                            var parameter_file = resultData.exec_file.parameter_file;

                            // get parameters file
                            var paramUrl = baseUrl + parameters;
                            // gateway.io에서 해당 파일을 요청
                            request({ url: paramUrl, timeout: 5000 }, function (error, response, body) {
                                var paramContent = "";
                                if(error){
                                    // gateway.io에서 가져오는걸 실패하여 cli 명령으로 ipfs와 통신
                                    var childPs = exec('ipfs cat ' + parameters, function (error, stdout, stderr) {
                                        if(error){
                                            console.log('fail to read ipfs data');
                                        }
                                        else{
                                            paramContent = stdout;
                                            // parameters 파일을 local에 저장
                                            var file = fs.createWriteStream(parameter_file);
                                            file.write(paramContent);
                                            paramFileReadDone = true;
                                        }
                                    });
                                }
                                else{
                                    paramContent = body;
                                    // parameters 파일을 local에 저장
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
                        var file_name = resultData.input_data.file_name;

                        // get input data
                        var inputUrl = baseUrl + index;
                        // gateway.io에서 해당 파일을 요청
                        request({ url: inputUrl, timeout: 5000 }, function (error, response, body) {
                            var inputContent = "";
                            if(error){
                                // gateway.io에서 가져오는걸 실패하여 cli 명령으로 ipfs와 통신
                                var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                                    if(error){
                                        console.log('fail to read ipfs data');
                                    }
                                    else{
                                        inputContent = stdout;
                                        // input data를 local에 저장
                                        var file = fs.createWriteStream(file_name);
                                        file.write(inputContent);
                                        inputFileReadDone = true;
                                    }
                                });
                            }
                            else{
                                inputContent = body;
                                // input data를 local에 저장
                                var file = fs.createWriteStream(file_name);
                                file.write(inputContent);
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
            // json object 형식으로 output read
            resultData = JSON.parse(stdout);
            // json파일을 local에 저장
            var file = fs.createWriteStream('example.json');
            file.write(stdout);

            jsonFileReadDone = true;

            // json parse
            // exec_file - index: exec file ipfs hash index, file_name: 저장할 file명
            //             parameters: parameters file ipfs hash index, parameter_file: 저장할 file명
            // input_data -  index: input data ipfs hash index, file_name: 저장할 file명
            // run_command - 실행할 명령어
            if(resultData.exec_file){
                execFileReadDone = false;
                var index = resultData.exec_file.index;
                var file_name = resultData.exec_file.file_name;

                // get exec file
                var execUrl = baseUrl + index;
                // gateway.io에서 해당 파일을 요청
                request({ url: execUrl, timeout: 5000 }, function (error, response, body) {
                    var execContent = "";
                    if(error){
                        // gateway.io에서 가져오는걸 실패하여 cli 명령으로 ipfs와 통신
                        var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                            if(error){
                                console.log('fail to read ipfs data');
                            }
                            else{
                                execContent = stdout;
                                // exec 파일을 local에 저장
                                var file = fs.createWriteStream(file_name);
                                file.write(execContent);
                                execFileReadDone = true;
                            }
                        });
                    }
                    else{
                        execContent = body;
                        // exec 파일을 local에 저장
                        var file = fs.createWriteStream(file_name);
                        file.write(execContent);
                        execFileReadDone = true;
                    }
                });

                if(resultData.exec_file.parameters){
                    parameter_file = false;
                    var parameters = resultData.exec_file.parameters;
                    var parameter_file = resultData.exec_file.parameter_file;

                    // get parameters file
                    var paramUrl = baseUrl + parameters;
                    // gateway.io에서 해당 파일을 요청
                    request({ url: paramUrl, timeout: 5000 }, function (error, response, body) {
                        var paramContent = "";
                        if(error){
                            // gateway.io에서 가져오는걸 실패하여 cli 명령으로 ipfs와 통신
                            var childPs = exec('ipfs cat ' + parameters, function (error, stdout, stderr) {
                                if(error){
                                    console.log('fail to read ipfs data');
                                }
                                else{
                                    paramContent = stdout;
                                    // parameters 파일을 local에 저장
                                    var file = fs.createWriteStream(parameter_file);
                                    file.write(paramContent);
                                    paramFileReadDone = true;
                                }
                            });
                        }
                        else{
                            paramContent = body;
                            // parameters 파일을 local에 저장
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
                var file_name = resultData.input_data.file_name;

                // get input data
                var inputUrl = baseUrl + index;
                // gateway.io에서 해당 파일을 요청
                request({ url: inputUrl, timeout: 5000 }, function (error, response, body) {
                    var inputContent = "";
                    if(error){
                        // gateway.io에서 가져오는걸 실패하여 cli 명령으로 ipfs와 통신
                        var childPs = exec('ipfs cat ' + index, function (error, stdout, stderr) {
                            if(error){
                                console.log('fail to read ipfs data');
                            }
                            else{
                                inputContent = stdout;
                                // input data를 local에 저장
                                var file = fs.createWriteStream(file_name);
                                file.write(inputContent);
                                inputFileReadDone = true;
                            }
                        });
                    }
                    else{
                        inputContent = body;
                        // input data를 local에 저장
                        var file = fs.createWriteStream(file_name);
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
});