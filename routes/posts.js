const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');

router.post('/create', isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI);
        const userId = req.user.id;

        await prisma.post.create({
            data: {
                photo: cldRes.secure_url,
                userId: userId,
            },
        });
        res.redirect('/posts');
    } catch (e) {
        console.log(e);
        res.json('Server error');
    }
});


router.get('/create', isAuthenticated, async (req, res) => {
    try {
        res.render('postCreate', { title: 'Create a post', error: req.flash('error') });
    } catch (e) {
        console.log(e);
        res.json('ServEer error');
    }
});

router.get("/", isAuthenticated, (req, res) => {
    res.render("profile");
});

module.exports = router;