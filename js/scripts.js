$(document).ready(function() {
	
	map = newyorkMap.drawMap();

	$("#form").submit(function(e) {
		e.preventDefault();
		
		var arguments = [];
		arguments = $('input').val().split(",");

		var zipcode = parseInt(arguments[0]);	
		var radius = parseInt(arguments[1]);

		getEvents(zipcode, map, radius);
	});
});

var newyorkMap = {	

	// Initialize the map centered on Manhattan
	latlon: {
		lat: '40.7507',
		lon: '-73.9965',
	},

	drawMap: function() {
		map = L.map('lmap').setView([this.latlon.lat, this.latlon.lon],13);
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
		return map;
	},
	drawMarkers: function(latlon, venue, description) {
		marker = new L.marker([latlon.lat, latlon.lon]).addTo(map)
		.bindPopup(venue + ": " + description);
		L.layerGroup().addLayer(marker);
	}
}

var getEvents = function(zip, map, radius) {
	//default to showing events in Manhattan
	zip = zip || 10001;
	radius = radius || 3000;
	var url = 'http://dev.virtualearth.net/REST/v1/Locations?postalCode=' + zip + '&key=Ascxy1k6vRhXRU8R5rOchA5dZvvGww07N2vEsg4KiMjYWkV_ni4-EtjLW2xNlzXf';
	var Coordinates = $.ajax({
		url: url,
		dataType: "jsonp",
		jsonp: "jsonp",
		success: function(r) {
			
			// store the coordinates of map center in object
			newyorkMap.latlon.lat = Coordinates.responseJSON.resourceSets[0].resources[0].point.coordinates[0];
			newyorkMap.latlon.lon = Coordinates.responseJSON.resourceSets[0].resources[0].point.coordinates[1];

			// Center the map on new coordinates
			map.panTo(newyorkMap.latlon);

			// get events using new coordinates
			getNYT(radius);
			
		},
		error: function(e) {
			alert(e.statusText);
		}
	});

}

var getNYT = function(rad, map) { 
	var url = 'http://api.nytimes.com/svc/events/v2/listings.json?&ll='+newyorkMap.latlon.lat+','+newyorkMap.latlon.lon+'&radius='+rad+'&api-key=458060ce8f04618f086016b9c362dac0:13:6140968';
	console.log(url);
		results = $.getJSON(url)
			.done(function()
			{
				$("#listhead").text("Following is a list of events in your area: ")
				// Clear results of previous searches.
				$("#kiosk .news").empty();

				$.each(results.responseJSON.results, function(index, array) { 
					var contentString = "<h1>" + array.event_name + "</h1><p>" + array.venue_name + ": "  + array.web_description + "</p><p><a href='" + array.event_detail_url + "'>" + array.event_detail_url + "</p>";
					$("#kiosk .news").append(contentString);
					// Store the coordinates for each EVENT in separate variables.
					var event_latlon = {
						lat: array.geocode_latitude,
						lon: array.geocode_longitude,
					};
					newyorkMap.drawMarkers(event_latlon, array.venue_name, array.web_description);
					console.log(url);
				});
				
			})
			.fail( function(jqXHR, textStatus, errorThrown) { 
				console.log(errorThrown.toString());
			} ); 
	return results;
}
