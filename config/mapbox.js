require('dotenv').config();

document.addEventListener('DOMContentLoaded', function () {
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY; // Reemplaza 'TU_MAPBOX_API_KEY' con tu clave de API de Mapbox
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-118.243683, 34.052235],
        zoom: 10,
    });
});
