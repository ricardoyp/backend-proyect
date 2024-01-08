const express = require("express");
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config()

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');

router.post('/create/:tripId', isAuthenticated, upload.single('photo'), async (req, res) => {
    try {

        const coordinates = req.body.location.split(',');
        
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const cldRes = await handleUpload(dataURI);

        const tripId = req.params.tripId;

        const location = await prisma.location.create({
            data: {
                latitude: coordinates[0],
                longitude: coordinates[1],
                name: coordinates[2],
            }
        });

        await prisma.post.create({
            data: {
                tripId: req.params.tripId,
                locationId: location.id,
                photo: cldRes.secure_url,
            },
        });
        res.redirect(`/trip/${tripId}`);
    } catch (e) {
        console.log(e);
        res.json('Server Error');
    }
});

router.get('/create/:tripId', isAuthenticated, async (req, res) => {
    try {
        const trip = await prisma.trip.findUnique({
            where:{
                id: req.params.tripId
            }
        })
        res.render('postCreate', { 
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
    const post = await prisma.post.findMany({
        include: {
            location: true,
            trip: {
                include: {
                    user: true
                }
            }
        }
    })
    console.log(post);
    res.render("posts", {post: post});
});

router.delete("/delete", isAuthenticated, async (req, res) => {
    const tripId = req.body.tripId;

    await prisma.post.delete({
        where: {
            id: req.body.postId,
        }
    })
    res.redirect(`/trip/${tripId}`);
})

module.exports = router;