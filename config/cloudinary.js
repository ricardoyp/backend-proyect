const cloudinary = require('cloudinary').v2;

require('dotenv').config(); // sin esta linea no podemos utilizar las variables de entorno

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;