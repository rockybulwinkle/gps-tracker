#!/usr/bin/node
"use strict";

var	port = 8080,
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	server,
    	homePage = '/testmap.html';

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
