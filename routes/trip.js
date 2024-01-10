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

router.get('/social', isAuthenticated, async (req, res) => {
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
});

router.get('/:tripId', isAuthenticated, async (req, res) => {
    try {
        const trip = await prisma.trip.findUnique({
            where:{
                id: req.params.tripId
            },
            include:{
                user: true,
                post: {
                    include: {
                        location: true 
                    }
                }
            }
        })
        const owner = req.user.id === trip.userId; // Si el userId guardado en req.user (Express-session) es igual al creador del trip (trip.userId) --> true
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
});

router.delete("/delete", isAuthenticated, async (req, res) => {
    try {
        const tripId = req.body.tripId;   //RECOGE EL ID DEL VIAJE QUE SE VA A ELIMINAR

        const postsToDelete = await prisma.post.findMany({   //BUSCA TODOS LOS POSTS DE ESE VIAJE
            where: {
                tripId: tripId
            }
        });

        postsToDelete.forEach(async (post) => {
            await prisma.location.delete({
                where: {
                    postId: post.id
                }
            });
        
            await prisma.post.delete({
                where: {
                    id: post.id
                }
            });
        });

        // Eliminar el viaje
        await prisma.trip.delete({
            where: {
                id: tripId
            }
        });

        res.redirect(`/user`);
    } catch (e) {
        console.log(e);
        res.json('ServEer error');
    }

})

module.exports = router;