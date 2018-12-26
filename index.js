// 필요한 require 정의
// io: socket io server api
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

/* GET home page. 사용하지 않음 */
app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	// requester가 보낸 json hash index를 접속된 offloader에 broadcasting
	socket.on('ipfsSetup', (data) => {
		socket.broadcast.emit('initIpfs', data);
	});

	// offloader가 보낸 결과를 requester에 전달
	socket.on('result', (data) => {
		socket.broadcast.emit('offloadingResult', data);
	});

	// client login log 생성
	socket.on('login', (data) => {
		console.log(`Client logged-in:\nuserid: ${data.userid}`);
		socket.userid = data.userid;
	});

	// force client disconnect from server
	socket.on('forceDisconnect', () => {
		socket.disconnect();
	});

	// client logout log 생성
	socket.on('disconnect', () => {
		console.log('user disconnected: ' + socket.name);
	});
});

// 3000 port 사용
server.listen(3000, () => {
	console.log('Socket IO server listening on port 3000');
});
