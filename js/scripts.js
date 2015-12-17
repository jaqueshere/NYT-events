$(document).ready(function() {
	
	map = newyorkMap.drawMap();

	$("#form").submit(function(e) {
		e.preventDefault();
			
		var arguments = [];
		arguments = $('input').val().split(",");
		console.log($('#date').val());
		var location = arguments[0];	
		var radius = arguments[1];

		/*Use the date object to construct a date range for query
		 *second Date() object will be used to represent date at end of range */

		var today = new Date();
		var last_day = new Date();
		/*use date_range to represent range. Using substring() to 
		 *get only the date part, leaving out times.
		 */
		var date_range = today.toISOString().substring(0,10) + ":";

		/*val()==0 corresponds to today, 1 to this week, 3 to this month */
		if ($('#date').val() == 0) {
			last_day.setDate(today.getDate()+1);
			date_range += last_day.toISOString().substring(0,10);
		}
		else if ($('#date').val() == 1) {
			last_day.setDate(today.getDate()+7);
			date_range += last_day.toISOString().substring(0,10);
		}
		else {
			last_day.setDate(today.getDate()+30);
			date_range += last_day.toISOString().substring(0,10);
		}

		getEvents(location, map, radius, date_range);
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

var getEvents = function(location, map, radius, date_range) {
	//default to showing events in Manhattan
	location = location || 10001;
	radius = radius || 3000;
	var url = "";

	//Test whether the first argument is a zip code or a street address
	var zip_pattern = /^\d{5}/;
	if (zip_pattern.test(location)) {
		url = 'http://dev.virtualearth.net/REST/v1/Locations?postalCode=' + location + '&key=Ascxy1k6vRhXRU8R5rOchA5dZvvGww07N2vEsg4KiMjYWkV_ni4-EtjLW2xNlzXf';
		
	}
	else {
		url = 'http://dev.virtualearth.net/REST/v1/Locations?locality="New York City"&addressLine=' + location +'&key=Ascxy1k6vRhXRU8R5rOchA5dZvvGww07N2vEsg4KiMjYWkV_ni4-EtjLW2xNlzXf';
		
	}

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
			getNYT(radius, date_range);
			
		},
		error: function(e) {
			alert(e.statusText);
		}
	});

}

var getNYT = function(rad, date_range, map) { 
	var url = 'http://api.nytimes.com/svc/events/v2/listings.json?&ll='+newyorkMap.latlon.lat+','+newyorkMap.latlon.lon+'&radius='+rad+'&date_range='+date_range+'&api-key=458060ce8f04618f086016b9c362dac0:13:6140968';
	console.log(url);
		results = $.getJSON(url)
			.done(function()
			{
				$("#listhead").text("Following is a list of events in your area: ")
				// Clear results of previous searches.
				$("#kiosk .news").empty();

				$.each(results.responseJSON.results, function(index, array) { 
					var name = array.event_name || "[NYT did not supply a name]";
					var venue = array.venue_name || "[NYT did not supply a venue!]";
					var contentString = "<h1>" + name + "</h1><p>" + venue + ": "  + array.web_description + "</p><p><a href='" + array.event_detail_url + "'>" + array.event_detail_url + "</p>";
					$("#kiosk .news").append(contentString);
					// Store the coordinates for each EVENT in separate variables.
					var event_latlon = {
						lat: array.geocode_latitude,
						lon: array.geocode_longitude,
					};
					newyorkMap.drawMarkers(event_latlon, venue, array.web_description);
					console.log(url);
				});
				
			})
			.fail( function(jqXHR, textStatus, errorThrown) { 
				console.log(errorThrown.toString());
			} ); 
	return results;
}
