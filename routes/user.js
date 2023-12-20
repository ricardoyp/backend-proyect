const express = require("express");
const router = express.Router();

const prisma = require("../prisma");

router.get("/", (req, res) => {
    res.render("profile", { error: req.flash("error") });
});

router.put('/')

module.exports = router;