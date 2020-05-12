// connect to data sources
//pull in data
let earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

let faultLinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


renderMap(earthquakeURL, faultLinesURL);




// start mapping map layers

function renderMap(earthquakeURL, faultLinesURL) {

  // Get earthquake data
    d3.json(earthquakeURL, function(data) {
       console.log(earthquakeURL)
    // Get response for the earthquake data
    let earthquakeData = data;
    // GET request for the fault lines URL
    d3.json(faultLinesURL, function(data) {
      // Stores response into fault line data
      let faultLineData = data;

      // Push data into Features function
      createFeatures(earthquakeData, faultLineData);
    });
  });





  // Function to create features for earthquake and faultline data
  function createFeatures(earthquakeData, faultLineData) {

    // Create circle for each earthquake
    function onEachQuakeLayer(feature, layer) {
      return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        fillOpacity: .3,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        radius:  markerSize(feature.properties.mag)
      });
    }
    function onEachEarthquake(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }

    // add fault lines
    function onEachFaultLine(feature, layer) {
      L.polyline(feature.geometry.coordinates);
    }

    
    // Creates a GeoJSON layer for faultline 

    let faultLines = L.geoJSON(faultLineData, {
      onEachFeature: onEachFaultLine,
      style: {
        weight: 3,
        color: 'blue'
      }
    });

    // Creates a GeoJSON layer with earthquake
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachEarthquake,
      pointToLayer: onEachQuakeLayer
    });

    createMap(earthquakes, faultLines);
  }

  // Function to create map
  function createMap(earthquakes, faultLines) {

    //pull in dark layer with API key
    //pull in code for mapbox
    var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 20,
      id: "mapbox.dark",


      //pull in MapBox API
      accessToken: API_KEY
    });



    //pull in layers for mapbox with API key
    //pull in code for mapbox
    var satellite= L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 10,
      id: "mapbox.satellite",

      //pull in MapBox API
      accessToken: API_KEY
    });
    

    // Define a baseMaps object to hold base layers
    let baseMaps = {
      "Satellite": satellite,
      "Dark": dark,
    };

    // Create overlay object to hold overlay layers
    let overlayMaps = {
      "Fault Lines": faultLines,
      "Earthquakes": earthquakes,
    };

    // Create map for fault Lines layers
    let map = L.map("map", {
      zoom: 1,
      center: [39, 0.5],
      layers: [satellite, faultLines],
      scrollWheelZoom: true
    });

    // Add layer with button for maps
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    // Adding legend to map
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
      let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };
    legend.addTo(map);

  }
}

// Create circles for magnitude size
function markerSize(magnitude) {
  return magnitude * 4;
}

// Create color scheme for earthquake magnintude

function chooseColor(magnitude) {
  return magnitude > 5 ? "red":
    magnitude > 4 ? "orange":
      magnitude > 3 ? "gold":
        magnitude > 2 ? "yellow":
          magnitude > 1 ? "yellowgreen":
            "greenyellow"; 
}

