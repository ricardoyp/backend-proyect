const express = require("express");
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config()

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');

router.post('/create', isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
        console.log(req.body.location);

        const coordinates = req.body.location.split(',');
        
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const cldRes = await handleUpload(dataURI);

        const userId = req.user.id;

        const location = await prisma.location.create({
            data: {
                latitude: coordinates[0],
                longitude: coordinates[1],
                name: coordinates[2] 
            }
        })
        await prisma.post.create({
            data: {
                userId: userId,
                locationId: location.id,
                photo: cldRes.secure_url,
            },
        });
        res.redirect('/posts');
    } catch (e) {
        console.log(e);
        res.json('Server Error');
    }
});

router.get('/create', isAuthenticated, async (req, res) => {
    try {
        res.render('postCreate', { 
            title: 'Create a post', 
            mapBoxApiKey: process.env.MAPBOX_API_KEY,
            error: req.flash('error') 
        });
    } catch (e) {
        console.log(e);
        res.json('ServEer error');
    }
});

router.get("/", isAuthenticated, async (req, res) => {
    const post = await prisma.post.findMany({
        include: {
            location: true,
            user: true,
        }
    })
    console.log(post);
    res.render("posts", {post: post});
});


module.exports = router;