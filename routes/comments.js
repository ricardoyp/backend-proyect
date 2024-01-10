const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const isAuthenticated = require('..//middleware/isAuthenticated');

router.post("/post", isAuthenticated, async (req, res) => {
    const tripId = req.body.tripId;
    
    await prisma.comment.create({
        data: {
            userId: req.user.id,
            postId: req.body.postId,
            text: req.body.comment
        }
    })
    res.redirect(`/trip/${tripId}`);
})

module.exports = router;