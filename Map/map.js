var socket;
var map;

function connect(){
	socket = io.connect(location.host);
	//socket = io.connect(null);
	socket.on('test', function(){
		alert("test");
	});
	socket.on('loc', plot);
	//socket.on('loc', function(params){
	//	alert('lat: '+params.lat);
	//});
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
	socket.emit('test');
}

function plot(params){
	var pos = new google.maps.LatLng(params.lat, params.long);
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
		title: 'Marker'
	});
	map.panTo(pos);
}

google.maps.event.addDomListener(window, 'load', initialize);
map.addListener('moveTo', moveTo);
