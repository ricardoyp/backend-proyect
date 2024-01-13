const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const prisma = require("../prisma");

// Ruta de registro
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

// Ruta de inicio de sesión, ejecuta la estrategia local de passport
router.post("/login", passport.authenticate("local", {
    successRedirect: "/trip/social",
    failureRedirect: "/auth/login-page",
    failureFlash: true,
})
);

router.get("/login-page", (req, res) => {
    res.render("login", { error: req.flash("error") });
});

router.get("/register-page", (req, res) => {
    res.render("register", { error: req.flash("error") });
});

router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/auth/login-page")
    });
});

module.exports = router;