#!/usr/bin/node

var sys = require("sys"),
    repl = require("repl"),
    serialPort = require("serialport").SerialPort;

var serial = new serialPort("/dev/ttyO4", {baudrate:9600})

serial.on("data", function(chunk){
	sys.puts(chunk);
});
