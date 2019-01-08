const fs = require('fs');
const io = require('socket.io').listen(3333);
const ss = require('socket.io-stream');
const path = require('path');

io.on('connection', function(socket){
  ss(socket).on('json', function(stream, data){
    var json_name = data.name;
    stream.pipe(fs.createWriteStream(json_name));

    // TODO : should refine this part! There is redundancy here
    stream.on('finish', function(){
      var json_data = JSON.parse(fs.readFileSync);

      if(json_data.parameters){
        var parameter_names = json_data.parameters.file_name;
        for(let idx=0; idx < parameter_names.length; idx++){
          ss(socket).on('param'+idx, function(stream, data){
            let param_name = data.name;
            stream.pipe(fs.creataeWriteStream(param_name));
          })
        }
      }
      
    });
  })
})
