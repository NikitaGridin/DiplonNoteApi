const express = require('express');
const router = express.Router();
const userRouter = require('./userRouter')
const authRouter = require('./authRouter')
const albumRouter = require('./albumRouter')
const genreRouter = require('./genreRouter')
const trackRouter = require('./trackRouter')
const authorsRouter = require('./authorsRouter')
const adminRouter = require('./adminRouter')
const changeStatusRouter = require('./changeStatusRouter')
const connectionsRouter = require('./connectionsRouter')
const playlistRouter = require('./playlistRouter')
const searchRouter = require('./searchRouter')
const librayRouter = require('./librayRouter')

router.use("/auth", authRouter)
router.use("/user", userRouter)
router.use("/album", albumRouter)
router.use("/genre", genreRouter)
router.use("/track", trackRouter)
router.use("/author", authorsRouter)
router.use("/admin", adminRouter)
router.use("/changeStatus", changeStatusRouter)
router.use("/connections", connectionsRouter)
router.use("/playlist", playlistRouter)
router.use("/search", searchRouter)
router.use("/libray", librayRouter)

module.exports = router;
