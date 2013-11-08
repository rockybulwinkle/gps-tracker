#!/usr/bin/node
"use strict";

var	port = 8080,
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	server,
	homePage = '/map.html';

function send404(res){
	res.writeHead(404);
	res.write('404');
	res.end();
}

//Create Server

server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	console.log("path: "+path);
	if(path === '/'){
		path = homePage;
	}
	console.log("path: "+path);
	fs.readFile(__dirname + path, function(err, data){
		if(err) {return send404(res)};
		res.write(data, 'utf8');
		res.end();
	});
});

//Listen to port
server.listen(port);
console.log("Listening on "+ port);

var io = require('socket.io').listen(server);
io.set('log level', 2);

io.sockets.on('connection', function(socket){
	socket.on('test', function(){
		console.log("This is a test");
		socket.emit('test');
	});	
	socket.on('loc', function(params){
		console.log("Lat: "+ params.lat + " Long: "+ params.long);
		socket.emit('loc_recv', {status:'recv'});
		socket.broadcast.emit('loc', {lat:params.lat, long:params.long});
		console.log('loc_recv sent');	
	});
	socket.on('move', function(){
		console.log("Sending move request");
		socket.broadcast.emit('move', {hi:"hi"});
		console.log("Move request Sent");
	});
});
