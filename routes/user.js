const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');

router.get("/", isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const posts = await prisma.post.findMany({
        where: {
            userId: userId
        },
        include: {
            location: true,
        }
    });
    res.render("profile", { user: req.user, posts: posts});
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

router.get('/update', (req, res) => {
    res.render('updateProfile', {user: req.user})
})

module.exports = router;