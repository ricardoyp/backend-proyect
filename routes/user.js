const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');

router.get('/update', isAuthenticated, (req, res) => {
    res.render('updateProfile', {user: req.user})
})

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

    res.render("profile", {
        user: user,
        trips: trips,
        owner: owner,
    });
});

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