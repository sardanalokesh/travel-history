function mapInit() {

  	window.map = new google.maps.Map(document.getElementById('output'), {
	    zoom: 2,
	    center: {lat: 51.4826, lng: 0.0077},
	    styles: mapStyles
	});
  	
  	FB.init({
      appId      : '140711213239353',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.11'
    });
      
    FB.AppEvents.logPageView();

    FB.getLoginStatus(function(response) {
	    statusChangeCallback(response);
	});
  	
  }

  function statusChangeCallback(response) {
		console.log(response);
		if (response.status === 'connected') {
			window.userID = response.authResponse.userID;
			window.accessToken = response.authResponse.accessToken;
			console.log("Logged in as User: " + window.userID);
			doSomething();
		} else {
			window.location.replace('/login.html');
		}
	}

function doSomething() {
	$("#errormsg").hide();
	$("#output").css("visibility", "visible");
	/*$("#userInfo").show();*/
	FB.api('/me', function(response) {
		if (response && !response.error) {
			document.getElementById('usernamelink').innerHTML = response.name; 	
		}
	});

	let tagPlaceUrl = "/me/tagged_places?limit=10000&fields=created_time,place{name,location{city,country,latitude,longitude}}";

	FB.api(tagPlaceUrl, function(response) {
		if (response && !response.error) {
			let data = response.data;
			//addTable(data);
			plotOnMap(data);
		}
	});
}

function plotOnMap(data) {
	let geojson = getGeoJson(data);
	let markers = geojson.features.map(feature => {
  		let lng = feature.geometry.coordinates[0];
  		let lat = feature.geometry.coordinates[1];
  		let name = feature.properties.name;
  		let city = feature.properties.city;
  		let country = feature.properties.country;
  		let time = feature.properties.time;
  		let contentString = "<div style='font-weight: bold;'>" + name + "</div>";
  		contentString += "<div>" + (city || "") + (country ? ", " + country : "") + "</div>";
  		contentString += time.reduce((a,t) => a + "<div>" + moment(t).format("MMM DD, YYYY hh:mm A")  + "</div>", "");
  		let infowindow = new google.maps.InfoWindow({
          content: contentString
        });
  		let marker =  new google.maps.Marker({
	  		position: {lat: lat, lng: lng}
	  	});
	  	marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
	  	return marker;
  	});

  	let markerCluster = new MarkerClusterer(window.map, markers,
      {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

}

function getGeoJson(data) {
	let map = {};
	data.forEach(d => {
		if (!map.hasOwnProperty())
			map[d.place.location.longitude + "," + d.place.location.latitude] = [];
		map[d.place.location.longitude + "," + d.place.location.latitude].push(d.created_time);
	});

	//remove duplicates
	data.filter((d,i,self) => i === self.findIndex(t => (
		d.place.location.longitude === t.place.location.longitude && d.place.location.latitude === t.place.location.latitude)  
	));

	let featureCollection = {
		type: "FeatureCollection",
		features: []
	};
	data.forEach(d => {
		let feature = {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [d.place.location.longitude,d.place.location.latitude]
			},
			properties: {
				time: map[d.place.location.longitude + "," + d.place.location.latitude],
				name: d.place.name,
				city: d.place.location.city,
				country: d.place.location.country
			}
		};
		featureCollection.features.push(feature);
	});
	return featureCollection;
}

function addTable(data) {
	let html = "<table><thead><tr><th>Time</th><th>Place</th><tr><thead><tbody>";
	data.forEach(d => {
		let row = "<tr>";
			row += "<td>" + d.created_time + "</td>";
			row += "<td>" + d.place.location.city + ", " + d.place.location.country + "</td>";
			row += "</tr>";
			html += row;
	});
	html += "</table>";
	document.getElementById("output").innerHTML = html;
}

function logout() {
	FB.logout(function(response) {
		console.log("logout", response);
		window.location.replace("/login.html");
	});
}