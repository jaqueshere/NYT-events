$(document).ready(function() {
	$("#form").submit(function(e) {
		e.preventDefault();
		var zipcode = $('input').val();		
		
		getEvents(zipcode);
	});
});


var getEvents = function(zip) {
	var url = 'http://dev.virtualearth.net/REST/v1/Locations?postalCode=' + zip + '&key=Ascxy1k6vRhXRU8R5rOchA5dZvvGww07N2vEsg4KiMjYWkV_ni4-EtjLW2xNlzXf';
	var Coordinates = $.ajax({
		url: url,
		dataType: "jsonp",
		jsonp: "jsonp",
		success: function(r) {
			//console.log(Coordinates);
			latlon = {};
			latlon.lat = Coordinates.responseJSON.resourceSets[0].resources[0].point.coordinates[0];
			latlon.lon = Coordinates.responseJSON.resourceSets[0].resources[0].point.coordinates[1];
			getNYT(latlon.lat, latlon.lon, 1000);
		},
		error: function(e) {
			alert(e.statusText);
		}
	});

}

var getNYT = function(lat, lon, rad) { 
	var url = 'http://api.nytimes.com/svc/events/v2/listings.json?&ll='+lat+','+lon+'&radius='+rad+'&api-key=458060ce8f04618f086016b9c362dac0:13:6140968';
	console.log(url);
		results = $.getJSON(url)
			.done(function()
			{
				//console.log(news.results);
				$.each(results.responseJSON.results, function(index, array) { 
					var contentString = "<h1>" + array.event_name + "</h1><p>" + array.venue_name + ": "  + array.web_description + "</p><p>" + array.event_detail_url;
					$("#kiosk").css("display", "block");
					$("#kiosk").append(contentString);
					var event_latlon = {
						lat: array.geocode_latitude,
						lon: array.geocode_longitude,
					};
					mapIt(latlon, array.venue_name, array.web_description);
					console.log(url);
				});
				
			})
			.fail( function(jqXHR, textStatus, errorThrown) { 
				console.log(errorThrown.toString());
			} );
			//console.log(event_title); 
			return results;
}

var mapIt = function(latlon, venue, description) {
	console.log(venue);
	console.log(latlon);
	console.log(description);
}