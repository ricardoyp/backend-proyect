const express = require("express");
const router = express.Router();

const dotenv = require('dotenv');  //PARA CARGAR LAS VARIABLES DEL ARCHIVO .env
dotenv.config()

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');
/**
 * @swagger
 * tags:
 *   - name: Trip
 *     description: Trips Routes
 */

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Creates a new trip
 *     tags:
 *       - Trip
 *     requestBody:
 *       description: Trip creation data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameTrip:
 *                 type: string
 *                 description: Name of the new trip
 *             required:
 *               - nameTrip
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       401:
 *         description: Unauthorized access
 *       400:
 *         description: Invalid trip data
 *       500:
 *         description: Server error
 */
router.post('/create', isAuthenticated, async (req, res) => {
    try {
        const nameTrip = req.body.nameTrip;

        const trip = await prisma.trip.create({
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

/**
 * @swagger
 * /create:
 *   get:
 *     summary: Renders the trip creation form
 *     tags:
 *       - Trip
 *     security:
 *       - auth:
 *         - user
 *     responses:
 *       200:
 *         description: Trip creation form rendered successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /social:
 *   get:
 *     summary: Displays social feed with trips and top users
 *     tags:
 *       - Trip
 *     security:
 *       - auth:
 *         - user
 *     responses:
 *       200:
 *         description: Social feed rendered successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.get('/social', isAuthenticated, async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            include:{
                user: true
            }
        });

        const users = await prisma.user.findMany({
            include: {
                trips: true,
            },
            orderBy: {
                trips: {
                _count: 'desc',
                },
            },
            take: 3,
        });
        res.render('social', {
            trips: trips,
            users: users,
            error: req.flash('error') 
            })
    } catch (e) {
        console.log(e);
        res.json('Server error');
    }
});

/**
 * @swagger
 * /:tripId:
 *   get:
 *     summary: Retrieves a specific trip by ID and its details
 *     tags:
 *       - Trip
 *     parameters:
 *       - name: tripId
 *         description: ID of the trip to be retrieved
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Trip details retrieved successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
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
                        location: true,
                        comments: {
                            include: {
                                user: true,
                                post: true,
                            }
                        }
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

/**
 * @swagger
 * /updateName/:tripId:
 *   get:
 *     summary: Renders the trip name update form
 *     tags:
 *       - Trip
 *     security:
 *       - auth:
 *         - user
 *     parameters:
 *       - name: tripId
 *         description: ID of the trip to be updated
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Trip name update form rendered successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.get('/updateName/:tripId', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const trip = await prisma.trip.findUnique({
            where: {
                id: req.params.tripId
            }
        })
        res.render('updateTripName', { 
            trip: trip,
            userId: userId,
            error: req.flash('error') 
        });
    } catch (e) {
        console.log(e);
        res.json('Server error');
    }
});

/**
 * @swagger
 * /updateName/:tripId:
 *   put:
 *     summary: Updates the name of a specific trip
 *     tags:
 *       - Trip
 *     security:
 *       - auth:
 *         - user
 *     parameters:
 *       - name: tripId
 *         description: ID of the trip whose name to be updated
 *         in: path
 *         required: true
 *         type: integer
 *     requestBody:
 *       description: Trip name update data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nameTrip:
 *                 type: string
 *                 description: Updated name of the trip
 *             required:
 *               - nameTrip
 *     responses:
 *       200:
 *         description: Trip name updated successfully
 *         redirect: /trip/{tripId}
 *       401:
 *         description: Unauthorized access
 *       400:
 *         description: Invalid trip data
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */ 
router.put('/updateName/:tripId', isAuthenticated, async (req, res) => {
    const trip = await prisma.trip.update({
        where: {
            id: req.params.tripId,
        },
        data: {
            name: req.body.nameTrip
        },
    });
    res.redirect(`/trip/${trip.id}`);
})

/**
 * @swagger
 * /delete:
 *   delete:
 *     summary: Deletes a trip and all associated posts and comments
 *     tags:
 *       - Trip
 *     security:
 *       - auth:
 *         - user
 *     requestBody:
 *       description: Request body containing the trip ID to be deleted
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tripId:
 *                 type: integer
 *                 description: ID of the trip to be deleted
 *     responses:
 *       200:
 *         description: Trip and associated posts and comments deleted successfully
 *         redirect: /auth/login-page
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.delete("/delete", isAuthenticated, async (req, res) => {
    try {
        const tripId = req.body.tripId;   //RECOGE EL ID DEL VIAJE QUE SE VA A ELIMINAR

        const postsToDelete = await prisma.post.findMany({   //BUSCA TODOS LOS POSTS DE ESE VIAJE
            where: {
                tripId: tripId
            }
        });

        for (const post of postsToDelete) {
            await prisma.location.delete({
                where: {
                    postId: post.id
                }
            });
            await prisma.comment.deleteMany({
                where: {
                    postId: post.id
                }
            })
            await prisma.post.delete({
                where: {
                    id: post.id
                }
            });
        }

        // Eliminar el viaje
        await prisma.trip.delete({
            where: {
                id: tripId
            }
        });

        res.redirect(`/auth/login-page`);
    } catch (e) {
        console.log(e);
        res.json('Server error');
    }

})

module.exports = router;