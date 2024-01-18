const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const prisma = require("../prisma");

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication Routes
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 format: email
 *               password:
 *                 type: string
 *                 description: User's password
 *               passwordConfirmation:
 *                 type: string
 *                 description: User's password confirmation
 *             required:
 *               - username
 *               - email
 *               - password
 *               - passwordConfirmation
 *     responses:
 *       200:
 *         description: Successful registration
 *       400:
 *         description: Invalid registration data
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res) => {
    try {
        if (req.body.password !== req.body.confirmPassword) {
            req.flash("error", "Las contraseñas no coinciden");
            return res.redirect("/auth/register-page");
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await prisma.user.create({
            data: {
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
            },
        });
        res.redirect("/auth/login-page");
    } catch (error) {
        console.log(error);
        res.redirect("/auth/register-page");
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: User login data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: User's password
 *             required:
 *               - username
 *               - password
 *     responses:
 *       302:
 *         description: Redirect to the appropriate URL based on the login status
 *         oneOf:
 *           - description: Redirect to /trip/social on successful login
 *           - description: Redirect to /auth/login-page on failed login with flash message
 */
router.post("/login", passport.authenticate("local", {
    successRedirect: "/trip/social",
    failureRedirect: "/auth/login-page",
    failureFlash: true,
})
);

/**
 * @swagger
 * /auth/register-page:
 *   get:
 *     summary: Register page
 *     tags: 
 *       - Auth
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Error response
 */
router.get("/register-page", (req, res) => {
    res.render("register", { error: req.flash("error") });
});

/**
 * @swagger
 * /auth/login-page:
 *   get:
 *     summary: Login page
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Error response
 */
router.get("/login-page", (req, res) => {
    res.render("login", { error: req.flash("error") });
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: 
 *       - Auth
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized, user is not logged in
 */
router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/auth/login-page")
    });
});

module.exports = router;