const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const upload = require('../config/multer');
const handleUpload = require('../middleware/handleUpload');
const isAuthenticated = require('..//middleware/isAuthenticated');

router.get('/create', isAuthenticated, async (req, res) => {
    try {
        res.render('tripCreate', { 
            title: 'Create a post', error: req.flash('error') 
        });
    } catch (e) {
        console.log(e);
        res.json('ServEer error');
    }
});

module.exports = router;