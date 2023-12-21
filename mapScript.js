require('dotenv').config();

// Accede a la clave de acceso a Mapbox desde process.env
mapboxgl.accessToken = process.env.MAPBOX_API_KEY;

var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-118.243683, 34.052235],
    zoom: 10,
})

