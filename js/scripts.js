$(document).ready(function() {
	var contentString = "";
	/*$("#form").submit(function() {
		$("#kiosk").show();
	});*/
	$("#form").submit(function(e) {
		e.preventDefault();
		var zipcode = $('input').val();
		
		latlon = {};
		
		latlon = getCoordinates(zipcode, latlon);
		console.log(latlon);
		coordinates = $("input:first").val().split(",");
		/*latitude = coordinates[0];
		longitude = coordinates[1];*/
		radius = coordinates[2];
		
		//getEvents(latlon.lat, latlon.lon, radius);

	});
});

var getCoordinates = function(zip, latlon) {
	var url = 'http://dev.virtualearth.net/REST/v1/Locations?postalCode=' + zip + '&key=Ascxy1k6vRhXRU8R5rOchA5dZvvGww07N2vEsg4KiMjYWkV_ni4-EtjLW2xNlzXf';
	var Coordinates = $.ajax({
		url: url,
		dataType: "jsonp",
		jsonp: "jsonp",
		success: function(r) {
			//console.log(Coordinates);
			latlon.lat = Coordinates.responseJSON.resourceSets[0].resources[0].point.coordinates[0];
			latlon.lon = Coordinates.responseJSON.resourceSets[0].resources[0].point.coordinates[1];
			return latlon;
		},
		error: function(e) {
			alert(e.statusText);
		}
	});
}


var getEvents = function(lat, lon, rad) { 
	var url = 'http://api.nytimes.com/svc/events/v2/listings.json?ll{'+lat+'},{'+lon+'}&radius={'+rad+'}&api-key=458060ce8f04618f086016b9c362dac0:13:6140968';

		results = $.getJSON(url)
			.done(function()
			{
				//console.log(news.results);
				$.each(results.responseJSON.results, function(index, array) { 
					console.log(array.event_name);
				});
				/*console.log(data[3]);
				event_title = data[3];
				event_url = data[4];
				event_description = data[5];
				event_venue = data[6];
				venue_url = data[7];*/

				var contentString = "<h1>" + event_title + "</h1><p>" + event_description + "</p><p>" + event_venue + "</p><p>" + event_url + "</p><p>" + venue_url;

				$("#kiosk").append(contentString);
			})
			.fail( function(jqXHR, textStatus, errorThrown) { 
				console.log(errorThrown.toString());
			} );
			//console.log(event_title); 
			return results;
}