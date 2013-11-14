var socket;
var map;
var lastCoor=null;
var line;
var path =[];
var rad;


function connect(){
	socket = io.connect(location.host);
	socket.on('path_data', plot);	
	socket.on('clear', clear);
}

function initialize() {
	var mapOptions = {
        	center: new google.maps.LatLng(39.4827, -87.3240),
        	zoom: 16,
        	mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
	connect();
	setupRad();
}

function setupRad(){
	var radioLive = document.getElementById("live");
	var radioSearch = document.getElementById("search");
	var prev = null;
	
	radioLive.onclick = function(){
		if(this != prev){
			socket.emit('mode', {'mode':this.value});
			prev = this;
		}
	}
	radioSearch.onclick = function(){
		if(this != prev){
			socket.emit('mode', {'mode':this.value});
			prev = this;
		}
	}
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
		var green;
		var red;
		var my_hdp=0;
		var upperLimit = 3;
		var lowerLimit=1.2;
		if(params.hdp < lowerLimit){
			red ='00';
			green = 'FF';
		}
		else if(params.hdp > upperLimit){
			red = 'FF';
			green = '00';
		}
		else{
			//red = Math.ceil(255*(1-(-.3158 + .2632*params.hdp))).toString(16);
			//green = Math.ceil(255*(-.3158 + .2632*params.hdp)).toString(16);			
			my_hdp = (params.hdp-lowerLimit)/(upperLimit-lowerLimit)*255;
			red = my_hdp;
			green = 255-my_hdp;
			red = Math.round(red);
			green = Math.round(green);
			if (red < 16){
				red = "0"+red.toString(16)
			} else{
				red = red.toString(16)
			}
			if (green < 16){
				green = "0"+green.toString(16)
			} else{
				green = green.toString(16)
			}

		}
		var color = red +''+ green + '' +'00';
		alert(color);
		socket.emit('color',{'red':red, 'green':green, "my_hdp":my_hdp});
		var lineCoors = [new google.maps.LatLng(lastCoor.lat, lastCoor.long),
						 new google.maps.LatLng(params.lat, params.long)];
		var line = new google.maps.Polyline({
			path: lineCoors,
			geodesic: true,
			strokeColor: (color),
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
	lastCoor = null;
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
