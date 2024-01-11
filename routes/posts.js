const express = require("express");
const router = express.Router();

const dotenv = require('dotenv'); //PARA CARGAR LAS VARIABLES DEL ARCHIVO .env
dotenv.config()

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');

router.post('/create/:tripId', isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
        const coordinates = req.body.location.split(','); //SEPARA LA LOCALIZACION EN UN ARRAY CON LATITUDE Y LONGITUDE
        
        const b64 = Buffer.from(req.file.buffer).toString("base64");   //LOGICA PARA PASAR LA IMAGEN A FORMATO B64
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const cldRes = await handleUpload(dataURI);  

        const tripId = req.params.tripId;   //RECOGE EL VIAJE DONDE SE CREA EL POST

        const post = await prisma.post.create({    //CREA EL POST 
            data: {
                tripId: tripId,
                photo: cldRes.secure_url,
            },
        });

        await prisma.location.create({   //CREA LA LOCATION
            data: {
                latitude: coordinates[0],
                longitude: coordinates[1],
                name: coordinates[2],
                postId: post.id
            }
        });

        
        res.redirect(`/trip/${tripId}`);
    } catch (e) {
        console.log(e);
        res.json('Server Error');
    }
});

router.get('/create/:tripId', isAuthenticated, async (req, res) => {
    try {

        const trip = await prisma.trip.findUnique({ //RECOGE EL TRIP DONDE SE VA A CREAR UN POST
            where:{
                id: req.params.tripId
            }
        })

        res.render('postCreate', {  //RENDERIZA EN HBS --> 
            trip: trip,
            title: 'Create a post', 
            mapBoxApiKey: process.env.MAPBOX_API_KEY,
            error: req.flash('error') 
        });

    } catch (e) {
        console.log(e);
        res.json('Server error');
    }
});

router.get("/", isAuthenticated, async (req, res) => {
    //NO USADA DE MOMENTO
    try{
        const post = await prisma.post.findMany({   //MUESTRA TODOS LOS POSTS
            include: {
                location: true,
                trip: {
                    include: {
                        user: true
                    }
                }
            }
        })

        res.render("posts", {post: post});

    } catch (e) {
        console.log(e);
        res.json('Server error');
    }
});

router.delete("/delete", isAuthenticated, async (req, res) => {

    const tripId = req.body.tripId; //RECOJO DEL BODY EL ID DEL VIAJE PARA VOLVER CUANDO SE ELIMINE EL POST
    const postId = req.body.postId; 

    await prisma.location.delete({
        where: {
            postId: postId
        }
    })

    await prisma.post.delete({
        where: {
            id: postId
        }
    })

    res.redirect(`/trip/${tripId}`);
})

module.exports = router;