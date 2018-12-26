var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

/* GET home page. */
app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	socket.on('ipfsSetup', (data) => {
		socket.broadcast.emit('initIpfs', data);
	});

	socket.on('result', (data) => {
		socket.broadcast.emit('offloadingResult', data);
	});

	socket.on('login', (data) => {
		console.log(`Client logged-in:\nuserid: ${data.userid}`);
		socket.userid = data.userid;
	});

	socket.on('req', (data) => {
		console.log(`Request from ${socket.userid} with\nipfs: ${data.ipfs}\ninput: ${data.input}\nenv: ${data.env}\nbounty: ${data.bounty}`);

		setTimeout(() => {
			var result = "ReSuLt";
			console.log(`result for ${socket.userid}: ${result}`);
			var msg = {
				from: {
					userid: socket.userid
				},
				result: result
			};
			socket.emit('result', msg);
		}, 3000);
	});

	// force client disconnect from server
	socket.on('forceDisconnect', () => {
		socket.disconnect();
	})

	socket.on('disconnect', () => {
		console.log('user disconnected: ' + socket.name);
	});
});

server.listen(3000, () => {
	console.log('Socket IO server listening on port 3000');
});
