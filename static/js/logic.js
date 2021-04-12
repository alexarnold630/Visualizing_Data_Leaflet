$(document).ready(function() {
    makeMap();
});

function makeMap() {

    var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

    // Perform a GET request to the query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        success: function(data) {
            buildMap(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    }); 
}

function buildMap(data) {

    // Create the Tile Layers
    var dark_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    var light_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    // Create a map object
    var myMap = L.map("map", {
        center: [40.8136, -96.7026],
        zoom: 3,
        layers: [dark_mode, light_mode]
    });

    //Create markers
    var earthquakes = [];
    var circleList = [];
    data.features.forEach(function(earthquake) {
        var marker = L.geoJSON(earthquake, {
            onEachFeature: onEachFeature
        });
        earthquakes.push(marker);

        var circle = L.geoJSON(earthquake, {
            pointToLayer: function(feature, latlng) {
                var geojsonMarkerOptions = createMarkerOptions(feature);
                return L.circleMarker(latlng, geojsonMarkerOptions);
            },
            onEachFeature: onEachFeature
        });
        circleList.push(circle);
    });

    var marker_group = L.layerGroup(earthquakes);
    var marker_group2 = L.layerGroup(circleList);

    // Create layers
    var baseMaps = {
        "Light Mode": light_mode,
        "Dark Mode": dark_mode
    };

    var overlayMaps = {
        "Markers": marker_group,
        "Circles": marker_group2,
    };

    // Create layer legend
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    //Add layers
    marker_group2.addTo(myMap);

    //Create legend
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        
        //legend as html
        var legendDisplay = 
        `<div style = "background: #90ee90;height:10px;width:10px;display:inline-block"> </div> 
        <div style = "display:inline-block"> <10 Miles</div>
        </div> 
        <div>
        <div style = "background:#ffff00;height:10px;width:10px;display:inline-block"></div> 
        <div style = "display:inline-block">10 - 30 Miles</div>
        </div>
        <div>
        <div style = "background:#ffdf00;height:10px;width:10px;display:inline-block"></div>
        <div style = "display:inline-block">30 - 50 Miles</div>
        </div>
        <div>
        <div style = "background:#ffa500;height:10px;width:10px;display:inline-block"></div> 
        <div style = "display:inline-block">50 - 70 Miles</div>
        </div>
        <div>
        <div style = "background:#ff4500;height:10px;width:10px;display:inline-block"></div>
        <div style = "display:inline-block">70 - 90 Miles</div>
        </div> 
        <div>
        <div style = "background:#ff0000;height:10px;width:10px;display:inline-block"></div>
        <div style = "display:inline-block">90+ Miles</div>
        </div>`;

        div.innerHTML = legendDisplay;
        return (div)
    }

    // Add legend to map
    legend.addTo(myMap);

}

function createMarkerOptions(feature){

    var depth = feature.geometry.coordinates[2]

    var depthColor = "";
    if (depth > 90){
        depthColor = "#ff0000";
    } else if (depth > 70){
        depthColor = "#ff4500";
    } else if (depth > 50){
        depthColor = "#ffa500";
    } else if (depth > 30){
        depthColor = "#ffdf00";
    } else if (depth > 10){
        depthColor = "#ffff00";
    } else {
        depthColor = "#90ee90";
    }

    var geojsonMarkerOptions = {
        radius: (feature.properties.mag * 8) + 1,
        fillColor: depthColor,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    return (geojsonMarkerOptions)
}

//called in create circles
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.place) {
        layer.bindPopup(feature.properties.title);
    }
}

