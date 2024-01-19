const express = require("express");
const router = express.Router();

const dotenv = require('dotenv'); //PARA CARGAR LAS VARIABLES DEL ARCHIVO .env
dotenv.config()

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');
/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: Posts Routes
 */

/**
 * @swagger
 * /create/:tripId:
 *   post:
 *     summary: Creates a new post in a specific trip
 *     tags:
 *       - Posts
 *     security:
 *       - auth:
 *         - user
 *     parameters:
 *       - name: tripId
 *         description: ID of the trip where the post will be created
 *         in: path
 *         required: true
 *         type: integer
 *     requestBody:
 *       description: Post creation data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: location
 *                 description: Location of the post (latitude, longitude, name)
 *               photo:
 *                 type: string
 *                 description: url of photo of the post
 *             required:
 *               - location
 *               - photo
 *     responses:
 *       201:
 *         description: Post created successfully
 *         redirect: /trip/{tripId}
 *       401:
 *         description: Unauthorized access
 *       400:
 *         description: Invalid post data
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /create/:tripId:
 *   get:
 *     summary: Renders the post creation form for a specific trip
 *     tags:
 *       - Posts
 *     security:
 *       - auth:
 *         - user
 *     parameters:
 *       - name: tripId
 *         description: ID of the trip where the post will be created
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Post creation form rendered successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /deletePost:
 *   delete:
 *     summary: Deletes an existing post
 *     tags:
 *       - Posts
 *     security:
 *       - auth:
 *         - user
 *     requestBody:
 *       description: Request body containing the post ID and trip ID to be deleted
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tripId:
 *                 type: integer
 *                 description: ID of the trip where the post to be deleted belongs to
 *               postId:
 *                 type: integer
 *                 description: ID of the post to be deleted
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         redirect: /trip/{tripId}
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Trip or post not found
 *       500:
 *         description: Server error
 */
router.delete("/deletePost", isAuthenticated, async (req, res) => {
    try {
        const tripId = req.body.tripId; //RECOJO DEL BODY EL ID DEL VIAJE PARA VOLVER CUANDO SE ELIMINE EL POST
        const postId = req.body.postId; 

        await prisma.location.delete({
            where: {
                postId: postId
            }
        });

        await prisma.comment.deleteMany({
            where: {
                postId: postId
            }
        });

        await prisma.post.delete({
            where: {
                id: postId
            }
        })

        res.redirect(`/trip/${tripId}`);
    } catch (e) {
        console.log(e);
        res.json('Server Error');
    }

})

module.exports = router;