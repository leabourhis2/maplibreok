// Appel de cette dépendance au début du JavaScript
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// Configuration de la carte
var map = new maplibregl.Map({
container: 'map',
style: 'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json',
  customAttribution : '<a href="https://sites-formations.univ-rennes2.fr/mastersigat/"target="_blank">Master SIGAT / Marwan OUFTIR</a>',
  // Fond de carte
center: [-1.67, 48.11], // lat/long
zoom: 12, // zoom
pitch: 20, // Inclinaison
bearing: 0,
minZoom: 11, // permet de pas dezoomer à fond les ballons
  // Rotation
});

// Boutons de navigation
var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'top-left');

// Ajout Echelle cartographique
map.addControl(new maplibregl.ScaleControl({
maxWidth: 120,
unit: 'metric'}));

// Bouton de géolocalisation

map.addControl(new maplibregl.GeolocateControl
({positionOptions: {enableHighAccuracy: true},
trackUserLocation: true,
showUserHeading: true}));

//debut couches
map.on('load', function () {  

map.addSource("PLUsource", {
  type: "vector",
  url: "pmtiles://https://raw.githubusercontent.com/marwanouftir45-ui/data/refs/heads/main/plui.pmtiles"
});
map.on('zoomend', () => {
  const z = map.getZoom();

  if (z >= 15) {
    map.easeTo({
      pitch: 60,
      bearing: -20,
    });
  } else {
    map.easeTo({
      pitch: 0,
      bearing: 0,
    });
  }
});

map.addLayer({
      'layout' : {'visibility' : 'none'},
  id: "PLUsource",
  type: "fill",
  source: "PLUsource",
  "source-layer": "plui",
  paint: {
    "fill-opacity": 0.7,
    "fill-outline-color": 'white',
    "fill-color": [
      "match",
      ["get", "typezone"],
      "U",   "#db1702",
      "A",   "#fdee00",
      "Ah",  "#fea347",
      "N",   "#66b814",
      "#cccccc" // couleur par défaut
    ]
  }
});
 
// AJOUT DU CADASTRE ETALAB

map.addSource('Cadastre', {
type: 'vector',
url: 'https://openmaptiles.geo.data.gouv.fr/data/cadastre.json' });

map.addLayer({
'id': 'Cadastre',
'type': 'line',
'source': 'Cadastre',
'source-layer': 'parcelles',
'layout': {'visibility': 'none'},
'paint': {'line-color': '#4c015a', 'line-width' : 1.5},
'minzoom':14, 'maxzoom':22 });
 
 
map.addLayer({
  id: "PLUcontour",
  type: "line",
  'layout' : {'visibilty' : 'none'},
  source: "PLUsource",
  "source-layer": "plui",
  paint: {'line-color': 'white',
          "line-width" :{'base': 0.5,'stops': [[13, 0.2], [20, 2]]} }
  });
 
 
  // Ajout lignes de metros
map.addSource('lignes', {
type: 'geojson',
data: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/metro-du-reseau-star-traces-de-laxe-des-lignes/exports/geojson?lang=fr&timezone=Europe%2FBerlin'
});
 
map.addLayer({
'id': 'lignesmetros',
'type': 'line',
'layout' : {'visibility' : 'visible'},
'source': 'lignes',
'paint': {'line-opacity': 1, 'line-width': 3.5, // categoriser
'line-color': ['match',['get', 'ligne'],
'a', '#EE1D23',
'b', '#00893E',
'#ccc']
}
});
 
  // Ajout BDTOPO
map.addSource('BDTOPO', {
type: 'vector',
url: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/metadata.json',
minzoom: 14,
maxzoom: 19
});
 
map.addLayer({
  id: 'zonevege',
  type: 'fill',
  'layout' : {'visibility' : 'none'},
  source: 'BDTOPO',
  'source-layer': 'zone_de_vegetation',
  paint: {
    'fill-color': '#7CFC00','fill-opacity': 0.6
  }
});

map.addLayer({
'id': 'batiments',
minzoom: 12,
'type': 'fill-extrusion',
'source': 'BDTOPO',
'layout' : {'visibility' : 'visible'},
'source-layer': 'batiment',
'paint': {'fill-extrusion-color': 'pink',
'fill-extrusion-height':{'type': 'identity','property': 'hauteur'},
'fill-extrusion-opacity': 0.90,
'fill-extrusion-base': 0}
});

 
 
   // Ajout ADMIN_EXPRESS
map.addSource('ADMIN_EXPRESS', {
type: 'vector',
url: 'https://data.geopf.fr/tms/1.0.0/ADMIN_EXPRESS/metadata.json',
minzoom: 1,
maxzoom: 19
});
// Communes
map.addLayer({
  id: 'Commune',
'layout' : {'visibility' : 'visible'},
  type: 'line',
  source: 'ADMIN_EXPRESS',
  'source-layer': 'commune',
  paint: {
    'line-color': 'grey','line-width': 1
  }
});

 
// Vélostar API
$.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/vls-stations-etat-tr/records?limit=57',
function(data) {var geojsonData4 = {
type: 'FeatureCollection',
'layout' : {'visibility' : 'none'},
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
              nbvelo: element.nombrevelosdisponibles,
              nbscoles: element.nombreemplacementsactuels}};

})
};
map.addLayer({ 'id': 'Velostar',

'type':'circle',
'source': {'type': 'geojson',
'data': geojsonData4},
'layout' : {'visibility' : 'none'},
'paint': {'circle-color': '#e73a76','circle-radius':3.5,'circle-stroke-color':'#e5f5ff','circle-stroke-width': 1}
});
});
 
 
$.getJSON('https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/records?limit=20',
function(data) {var geojsonData4 = {
type: 'FeatureCollection',
'layout' : {'visibility' : 'visible'},
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
capacity: element.jrdinfosoliste}};

})
};
map.addLayer({ 'id': 'Parcrelais',

'type':'circle',
'source': {'type': 'geojson',
'data': geojsonData4},
'paint': {'circle-color': '#27a647','circle-radius': 6 ,'circle-stroke-color':'#e5f5ff','circle-stroke-width': 2 }
});
});
 

  //fin mapon
});


// =====================
// Interactivité HOVER
// =====================
var popup = new maplibregl.Popup({
  className: "popup-hover",
  closeButton: false,
  closeOnClick: false
});

map.on('mousemove', function(e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['Parcrelais'] });

  map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

  if (!features.length) {
    popup.remove();
    return;
  }

  var feature = features[0];

  popup
    .setLngLat(feature.geometry.coordinates)
    .setHTML(
      feature.properties.name + '<br>' +
      'Nombre de place : ' + feature.properties.capacity
    )
    .addTo(map);
});


// =====================
// Interactivité CLICK
// =====================
map.on('click', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['Velostar'] });

  if (!features.length) {
    return;
  }

  var feature = features[0];

  var popup1 = new maplibregl.Popup({
    offset: [0, -15],
    className: "popup-click"
  });

  popup1
    .setLngLat(feature.geometry.coordinates)
    .setHTML(
      '<h2>' + feature.properties.name + '</h2>' +
      '<h3>Nombre de vélos disponibles : ' + feature.properties.nbvelo + '</h3>' +
      '<p>Nombre de socles disponibles : ' + feature.properties.nbscoles + '</p>'
    )
    .addTo(map);
});

map.on('mousemove', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['Velostar'] });
  map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});


// switch layer
switchlayer = function (lname) {
            if (document.getElementById(lname).checked) {
                map.setLayoutProperty(lname, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(lname, 'visibility', 'none');
           }
        }

// Configuration onglets géographiques

document.getElementById('Rennes').addEventListener('click', function ()
{ map.flyTo({zoom: 12,
           center: [-1.672, 48.1043],
         pitch: 0,
            bearing:0 });
});

document.getElementById('Gare').addEventListener('click', function ()
{ map.flyTo({zoom: 16,
           center: [-1.672, 48.1043],
         pitch: 20,
            bearing: -197.6 });
});


document.getElementById('Rennes1').addEventListener('click', function ()
{ map.flyTo({zoom: 16,
           center: [-1.6396, 48.1186],
         pitch: 20,
            bearing: -197.6 });
});

document.getElementById('Rennes2').addEventListener('click', function ()
{ map.flyTo({zoom: 16,
           center: [-1.7023, 48.1194],
         pitch: 30,
            bearing: -197.6 });
});