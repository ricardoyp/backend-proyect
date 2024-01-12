const express = require("express");
const router = express.Router();

router.use('/auth',     require('./auth'))
router.use('/user' ,    require('./user'))
router.use('/posts',    require('./posts'))
router.use('/trip',     require('./trip'))
router.use('/comments', require('./comments'))

router.get("/", (req, res) => {
    res.redirect("/auth/login-page")
})

module.exports = router;