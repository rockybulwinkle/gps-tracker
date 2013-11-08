var socket;
var map;
var lastCoor=null;
var line;

function connect(){
	socket = io.connect(location.host);
	socket.on('test', function(){
		alert("test");
	});
	socket.on('loc', plot);	
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
		var pathCoors = [new google.maps.LatLng(lastCoor.lat, lastCoor.long),
						 new google.maps.LatLng(params.lat, params.long)];
		var path = new google.maps.Polyline({
			path: pathCoors,
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 2
		});
		path.setMap(map);
		lastCoor=params;
		map.panTo(params.lat, params.long);
	}
}

google.maps.event.addDomListener(window, 'load', initialize);
map.addListener('moveTo', moveTo);
