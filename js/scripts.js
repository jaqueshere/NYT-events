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
		 *second Date() object will be used to represent date at end of range 
		 *Use offset of -5 to get NY time
		 */

		var offset = -5;
		var today = new Date( new Date().getTime() + offset * 3600 * 1000);
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
		console.log(date_range);
		getEvents(location, map, radius, date_range);
	});
});

var newyorkMap = {	

	// Initialize the map centered on Manhattan
	latlon: {
		lat: '40.7507',
		lon: '-73.9965',
	},

	markerBox: {},

	drawMap: function() {
		map = L.map('lmap').setView([this.latlon.lat, this.latlon.lon],13);
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
		return map;
	},
	drawMarkers: function(latlon, name, venue, description, index) {
		marker = new L.marker([latlon.lat, latlon.lon]).addTo(map)
		.bindPopup(venue + ": " + name + description);
		L.layerGroup().addLayer(marker);

		/* Keep tabs on the markers so you can 
		 * access popups from scrolling content on right */
		newyorkMap.markerBox[index] = marker;

		marker.on('click', function(e) {
			var item = "#item" + index;
			$("#kiosk").scrollTo(item);
		});
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
		url = 'http://dev.virtualearth.net/REST/v1/Locations?locality="New York City"&addressLine=' + location + '&key=Ascxy1k6vRhXRU8R5rOchA5dZvvGww07N2vEsg4KiMjYWkV_ni4-EtjLW2xNlzXf';		
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
			getNYC(location, date_range);
			
		},
		error: function(e) {
			alert(e.statusText);
		}
	});

}

var getNYC = function(zip, date_range, map) {

	var url = 'https://api.cityofnewyork.us/calendar/v1/search.htm?app_id=ceadf58a&app_key=35d9aec5f7617963372a321f5f0e48bc&zip=' + zip;
	console.log(url);
	results = $.getJSON(url)
		.done(function(){
			$("#listhead").text("Following is a list of events in your area: ")
			//Clear results of previous searches.
			$("#kiosk .news").empty();
			var result_num = 0;


				$.each(results.responseJSON.results, function(index, array) { 
					result_num += 1;
					var name = items.name || "[NYT did not supply a name]";
					var venue = items.location || "[NYT did not supply a venue!]";
					var times = items.timePart || "No information on times."
					var contentString = "<div id = 'item" + result_num + "'><h1>" + name + "</h1><h2>" + venue + ": </h2><p>"  + array.web_description + "</p><p>When you can see it: " + times + "</p><p><a href='" + array.event_detail_url + "'>" + array.event_detail_url + "</p></div>";
					
					/*Repsonses without a venue seem always to be old (bad) listings, so don't use them. */
					if (array.venue_name) {
						$("#kiosk .news").append(contentString);

						//store an identifier for div in news column
						var link = "#item" + result_num;
						$(link).click(function(e) {
							var text = $(this).attr('id');
							text = text.slice(4);
							newyorkMap.markerBox[text].openPopup();
						});
						// Store the coordinates for each EVENT in separate variables.
						var event_latlon = {
							lat: geometry.lat,
							lon: geometry.lng,
						};
						newyorkMap.drawMarkers(event_latlon, name, venue, array.web_description, result_num);
						console.log(url);	
					}
					
				});
		})
		.fail(function(jqXHR, textStatus, errorThrown) { 
				console.log(errorThrown.toString());
			} );
	return results;
}

var getNYT = function(rad, date_range, map) { 
	var apiSuccess = function() {
		console.log('success');
	}
	var url = 'http://api.nytimes.com/svc/events/v2/listings.json?callback=apiSuccess&ll='+newyorkMap.latlon.lat+','+newyorkMap.latlon.lon+'&radius='+rad+'&date_range='+date_range+'&api-key=759ffb8dd0434573b672e950d1665118';
	console.log(url);
		results = $.getJSON(url)
			.done(function()
			{
				$("#listhead").text("Following is a list of events in your area: ")
				// Clear results of previous searches.
				$("#kiosk .news").empty();
				var result_num = 0;

				$.each(results.responseJSON.results, function(index, array) { 
					result_num += 1;
					var name = array.event_name || "[NYT did not supply a name]";
					var venue = array.venue_name || "[NYT did not supply a venue!]";
					var times = array.date_time_description || "No information on times."
					var contentString = "<div id = 'item" + result_num + "'><h1>" + name + "</h1><h2>" + venue + ": </h2><p>"  + array.web_description + "</p><p>When you can see it: " + times + "</p><p><a href='" + array.event_detail_url + "'>" + array.event_detail_url + "</p></div>";
					
					/*Repsonses without a venue seem always to be old (bad) listings, so don't use them. */
					if (array.venue_name) {
						$("#kiosk .news").append(contentString);

						//store an identifier for div in news column
						var link = "#item" + result_num;
						$(link).click(function(e) {
							var text = $(this).attr('id');
							text = text.slice(4);
							newyorkMap.markerBox[text].openPopup();
						});
						// Store the coordinates for each EVENT in separate variables.
						var event_latlon = {
							lat: array.geocode_latitude,
							lon: array.geocode_longitude,
						};
						newyorkMap.drawMarkers(event_latlon, name, venue, array.web_description, result_num);
						console.log(url);	
					}
					
				});
			})
			.fail( function(jqXHR, textStatus, errorThrown) { 
				console.log(errorThrown.toString());
			} ); 
	return results;
}
