const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const isAuthenticated = require('..//middleware/isAuthenticated');
/**
 * @swagger
 * tags:
 *   - name: Comment
 *     description: Comment Route
 */

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Creates a new comment for a post
 *     tags:
 *       - Comment
 *     requestBody:
 *       description: Comment creation data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tripId:
 *                 type: string
 *                 description: Trip ID associated with the comment to redirect when comment was posted
 *               postId:
 *                 type: string
 *                 description: Post ID to which the comment is attached
 *               comment:
 *                 type: string
 *                 description: Comment text
 *             required:
 *               - tripId
 *               - postId
 *               - comment
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Post or trip not found
 *       400:
 *         description: Invalid comment data
 *       500:
 *         description: Server error
 */
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