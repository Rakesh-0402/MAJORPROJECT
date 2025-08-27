(function () {
  if (!window.listingCoords) return; // Ensures you only render the map if coords exist.

  const [lng, lat] = window.listingCoords;  // GeoJSON format [lng, lat]

  // create a map
  const map = L.map('map', {
    center: [lat, lng],
    zoom: 13,     //zoom level
    scrollWheelZoom: true,   // enable zoom with mouse wheel
    zoomControl: true,       // add + / - buttons
    dragging: true           // hand-dragging enabled
  });

  //base map layers
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  });
  
 const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Earthstar Geographics' }
);


  osm.addTo(map); //Loads OSM by default when map starts.

  //  Airbnb-style Marker 
  const customIcon = L.divIcon({
    className: "airbnb-marker",
    html: `<div class="marker-inner"><i class="fas fa-home"></i></div>`,//fomt-awesome icon 
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });


  // Main listing marker + circle
  const marker = L.marker([lat, lng],{icon:customIcon})
   .bindPopup(`<b>${window.listingTitle || "Listing"}</b>`).addTo(map);
  const circle = L.circle([lat, lng], {
    radius: 800,
    color: "#666",
    weight: 0,          // no border
    fillColor: "#666",
    fillOpacity: 0.2
  }).addTo(map);

  const markersLayer = L.layerGroup([marker, circle]).addTo(map);

  // Search bar
  L.Control.geocoder({
    defaultMarkGeocode: true
  }).addTo(map);

  // Draggable Pegman marker (Airbnb-styled)
const pegmanIcon = L.divIcon({
  className: "pegman-marker",
  html: `<div class="pegman-inner"><i class="fas fa-street-view"></i></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const pegman = L.marker([lat+0.006, lng+0.034], {
  draggable: true,
  icon: pegmanIcon
}).addTo(map);

pegman.on("dragend", function (e) {
  const pos = e.target.getLatLng();
  window.open(
    `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${pos.lat},${pos.lng}`,
    "_blank"
  );
});


  // Layer Control
  const baseMaps = {
    "OpenStreetMap": osm,
    "Satellite": satellite,
  };

  const overlayMaps = {
    "Listings": markersLayer
  };

  L.control.layers(baseMaps, overlayMaps).addTo(map);

  // Hand cursor effect
  map.getContainer().style.cursor = "grab";
  map.on("mousedown", () => map.getContainer().style.cursor = "grabbing");
  map.on("mouseup", () => map.getContainer().style.cursor = "grab");
})();
