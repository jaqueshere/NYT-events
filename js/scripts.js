$(document).ready(function() {
	//create a map
	var map = L.map('lmap').setView([40.7507, -73.9965],13);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	$("#form").submit(function(e) {
		e.preventDefault();
		var arguments = [];
		arguments = $('input').val().split(",");

		var zipcode = parseInt(arguments[0]);	
		var radius = parseInt(arguments[1]);

		getEvents(zipcode, map, radius);
	});
});


var getEvents = function(zip, map, radius) {
	zip = zip || 10001;
	radius = radius || 3000;
	var url = 'http://dev.virtualearth.net/REST/v1/Locations?postalCode=' + zip + '&key=Ascxy1k6vRhXRU8R5rOchA5dZvvGww07N2vEsg4KiMjYWkV_ni4-EtjLW2xNlzXf';
	var Coordinates = $.ajax({
		url: url,
		dataType: "jsonp",
		jsonp: "jsonp",
		success: function(r) {
			
			// store the coordinates of map center in object
			latlon = {};
			latlon.lat = Coordinates.responseJSON.resourceSets[0].resources[0].point.coordinates[0];
			latlon.lon = Coordinates.responseJSON.resourceSets[0].resources[0].point.coordinates[1];

			// remove the default map and show newly centered map
			if(typeof(map)=='object') {
				console.log("hello");
				L.layerGroup().clearLayers();
				map.remove();
			}
			map = L.map('lmap').setView([latlon.lat, latlon.lon],13);
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			// get events
			getNYT(latlon.lat, latlon.lon, radius, map);
			
		},
		error: function(e) {
			alert(e.statusText);
		}
	});

}

var getNYT = function(lat, lon, rad, map) { 
	var url = 'http://api.nytimes.com/svc/events/v2/listings.json?&ll='+lat+','+lon+'&radius='+rad+'&api-key=458060ce8f04618f086016b9c362dac0:13:6140968';
	console.log(url);
		results = $.getJSON(url)
			.done(function()
			{
				//console.log(news.results);
				$.each(results.responseJSON.results, function(index, array) { 
					var contentString = "<h1>" + array.event_name + "</h1><p>" + array.venue_name + ": "  + array.web_description + "</p><p>" + array.event_detail_url;
					$("#kiosk").empty();
					$("#kiosk").append(contentString);
					var event_latlon = {
						lat: array.geocode_latitude,
						lon: array.geocode_longitude,
					};
					mapIt(map, event_latlon, array.venue_name, array.web_description);
					console.log(url);
				});
				
			})
			.fail( function(jqXHR, textStatus, errorThrown) { 
				console.log(errorThrown.toString());
			} );
			//console.log(event_title); 
	return results;
}

var mapIt = function(map, latlon, venue, description) {
	marker = new L.marker([latlon.lat, latlon.lon]).addTo(map)
		.bindPopup(venue + ": " + description);
	L.layerGroup().addLayer(marker);
}