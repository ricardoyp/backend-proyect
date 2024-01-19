const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');
/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User Routes
 */

/**
 * @swagger
 * /update:
 *   get:
 *     summary: Renders the user profile update form
 *     tags:
 *       - User
 *     security:
 *       - auth:
 *         - user
 *     responses:
 *       200:
 *         description: User profile update form rendered successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.get('/update', isAuthenticated, (req, res) => {
    res.render('updateProfile', {user: req.user})
})

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Displays user profile with trips and posts
 *     tags:
 *       - User
 *     security:
 *       - auth:
 *         - user
 *     responses:
 *       200:
 *         description: User profile rendered successfully
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.get("/", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const trips = await prisma.trip.findMany({
        where: {
            userId: userId,
        },
        include: {
            post: {
                include: {
                    location: true
                }
            }
        }
    });

    const owner = true;

    res.render("profile", { 
        user: req.user,
        trips: trips,
        owner: owner,
    });
});

/**
 * @swagger
 * /profile/:userId:
 *   get:
 *     summary: Displays another user's profile with trips and posts
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: userId
 *         type: string
 *         required: true
 *         description: ID of the user whose profile to display
 *     security:
 *       - auth:
 *         - user
 *     responses:
 *       200:
 *         description: Other user's profile rendered successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:userId", isAuthenticated, async (req, res) => {
    const user = await prisma.user.findUnique({  //RECOGE EL USUARIO CON EL ID DEL URL
        where: {
            id: req.params.userId,
        }
    })

    const trips = await prisma.trip.findMany({   //RECOGE SUS VIAJES
        where: {
            userId: req.params.userId,
        },
        include: {
            post: {
                include: {
                    location: true
                }
            }
        }
    })

    const owner = req.user.id === req.params.userId; // Si el userId guardado en req.user (Express-session) es igual al usuario de la url (req.params.userId) --> true

    if(req.params.userId === req.user.id){
        res.redirect("/user")
    }
    res.render("profile", {
        user: user,
        trips: trips,
        owner: owner,
    });
});

/**
 * @swagger
 * /update:
 *   put:
 *     summary: Updates user profile information
 *     tags:
 *       - User
 *     security:
 *       - auth:
 *         - user
 *     requestBody:
 *       required: true
 *       description: User profile information to be updated
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: 
 *                 type: string
 *               email:
 *                 type: string
 *             required: 
 *               - username
 *               - email
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       401:
 *         description: Unauthorized access
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.put('/update', isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const cldRes = await handleUpload(dataURI);

        await prisma.user.update({
            where: {
                id: req.user.id,
            },
            data: {
                username: req.body.username,
                email: req.body.email,
                photo: cldRes.secure_url,
            },
        });
        res.redirect('/user');
    } catch (error) {
        console.log(error);
        res.redirect('/user');
    }
});

/**
 * @swagger
 * /delete:
 *   delete:
 *     summary: Deletes a user and all associated trips, posts, and comments.
 *     tags:
 *       - User
 *     security:
 *       - auth:
 *         - user
 *     responses:
 *       200:
 *         description: User associated trips, posts and comments deleted successfully
 *         redirect: /user
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/delete", isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;   // Recoge el ID del usuario que se va a eliminar

        const tripsToDelete = await prisma.trip.findMany({   // Busca todos los viajes del usuario
            where: {
                userId: userId
            }
        });

        for (const trip of tripsToDelete) {
            const postsToDelete = await prisma.post.findMany({
                where: {
                    tripId: trip.id
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
                });
                await prisma.post.delete({
                    where: {
                        id: post.id
                    }
                });
            }
        }

        // Elimina los viajes del usuario
        await prisma.trip.deleteMany({
            where: {
                userId: userId
            }
        });

        // Elimina al usuario
        await prisma.user.delete({
            where: {
                id: userId
            }
        });

        res.redirect(`/user`);
    } catch (e) {
        console.log(e);
        res.json('Server error');
    }
})

module.exports = router;