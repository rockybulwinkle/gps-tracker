#!/bin/js17

function parse_nmea(data){
	data = data.split(',');
	print (data[1]);
}

parse_nmea("1,2,3,4");
