const express = require("express");
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config()

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');

router.post('/create', isAuthenticated, async (req, res) => {
    try {
        const nameTrip = req.body.nameTrip;

        
        await prisma.trip.create({
            data: {
                name: nameTrip,
                userId: req.user.id
            },
        });
        res.redirect('/user');
    } catch (e) {
        console.log(e);
        res.json('Server Error');
    }
});

router.get('/create', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        res.render('tripCreate', { 
            title: 'Create a post',
            userId: userId,
            error: req.flash('error') 
        });
    } catch (e) {
        console.log(e);
        res.json('ServEer error');
    }
});

router.get('/social', async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            include:{
                user: true
            }
        });
        res.render('social', {
            trips: trips,
            error: req.flash('error') 
            })
    } catch (e) {
        console.log(e);
        res.json('Server error');
    }
})

router.get('/:tripId', async (req, res) => {
    try {
        const trip = await prisma.trip.findUnique({
            where:{
                id: req.params.tripId
            },
            include:{
                post: {
                    include: {
                        location: true 
                    }
                }
            }
        })
        console.log(req.user.id);
        const owner = req.user.id === trip.userId; // Suponiendo que el ID de usuario está almacenado en el campo 'userId' del viaje
        console.log(req.user.id);
        res.render('trip', { 
            trip: trip,
            owner: owner,
            mapBoxApiKey: process.env.MAPBOX_API_KEY, 
            error: req.flash('error') 
        });
    } catch (e) {
        console.log(e);
        res.json('ServEer error');
    }
})
module.exports = router;