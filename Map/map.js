var socket;
var map;
var lastCoor=null;
var line;
var path =[];

function connect(){
	socket = io.connect(location.host);
	socket.on('test', function(){
		alert("test");
	});
	socket.on('path_data', plot);	
	socket.on('clear', clear);
}

function initialize() {
	var mapOptions = {
        	center: new google.maps.LatLng(-34.397, 150.644),
        	zoom: 8,
        	mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
	connect();
}

function moveTo(){
	var pos = new google.maps.LatLng(document.getElementById('lat').value,
				document.getElementById('long').value);
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
		title: 'Marker'
	});
	map.panTo(pos);
	socket.emit('move');
}

function plot(params){
	
	if (lastCoor == null){
		lastCoor = params;
		map.panTo(google.maps.LatLng(params.lat, params.long));
	}
	else{
		var lineCoors = [new google.maps.LatLng(lastCoor.lat, lastCoor.long),
						 new google.maps.LatLng(params.lat, params.long)];
		var line = new google.maps.Polyline({
			path: lineCoors,
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 2
		});
		//alert("Here");
		line.setMap(map);
		path.push(line);
		lastCoor=params;
		map.panTo(google.maps.LatLng(params.lat, params.long));
	}
}

function clear(){
	for(var i =0; i<path.length; i++){
		path[i].setMap(null);	
	}
	path = [];
}

function timeRange(){
	var startDate = document.getElementById('startDate').value;
	var startTime = document.getElementById('startTime').value;
    var first = new Date(startDate+'T'+startTime);
	//We must now compensate for the fact that this Datetime thinks it's in UTC
	var dateMillis = first.getTime();
	//getTimezoneOffset returns minutes, so we multiple by 60 to get seconds
	//And then by 1000 to get milliseconds
	first = new Date(dateMillis + first.getTimezoneOffset()*60*1000);

	endDate = document.getElementById('endDate').value;
	endTime = document.getElementById('endTime').value;
	second = new Date(endDate + 'T'+endTime);
	dateMillis = second.getTime();
	second = new Date(dateMillis + second.getTimezoneOffset()*60*1000);
	if(second.getTime() < first.getTime()){
		alert("Start Time must come before End Time");
	}
	else{
		socket.emit('time_req', {'start':first.toISOString(),
								'end':second.toISOString()});
		}
}

google.maps.event.addDomListener(window, 'load', initialize);
map.addListener('moveTo', moveTo);
