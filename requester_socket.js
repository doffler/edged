const fs = require('fs');
const io = require('socket.io-client');
const ss = require('socket.io-stream');

if(!process.argv[2]){
  console.log('Json file should be given');
  process.exit(1);
}

function uploadFile(file, index, name_str){
  var socket = io.connect('http://lynx.snu.ac.kr:3333');
  var stream = ss.createStream();
  ss(socket).emit(name_str, stream, {name : file, index : index});
  upload = fs.createReadStream(file).pipe(stream);
  upload.on('finish', function(){
    stream.destroy();
  })
}

function uploadFiles(file_list, index_list, default_str){
  for(let idx=0; idx < file_list.length; idx++){
    let file_name = file_list[idx];
    let file_index = index_list[idx];
    uploadFile(file_name, file_index, default_str+idx);
  }
}

var json_file = process.argv[2];
var json_index = process.argv[3];
var json_data = JSON.parse(fs.readFileSync(json_file, 'utf8'));

async function main(){
  var json_send = await uploadFile(json_file, json_index, 'json');
  if(json_data.parameters){
    var parameter_names = json_data.parameters.file_name;
    var parameter_indexes = json_data.parameters.index;
    uploaFiles(parameter_names, parameter_indexed, 'param');
  }
  if(json_data.exec_file){
    var exec_names = json_data.exec_file.file_name;
    var exec_index = json_data.exec_file.index;
    uploaFiles(exec_names, exec_index, 'exec');
  }
  if(json_data.input_data){
    var input_index = resultData.input_data.index;
    var input_name = resultData.input_data.file_name;
    uploadFile(input_name, input_index, 'input');
  }
}
