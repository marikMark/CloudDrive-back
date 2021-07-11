const Router = require('express');
const router = new Router();
const authRouter = require('./userRouter');
const driveRouter = require('./driveRouter');
const fs = require('fs');

router.use('/auth', authRouter);
router.use('/drive', driveRouter);
router.use('/', async (req, res) => {
    const {userId, _id, ext} = req.query;
    const filePath = `${process.env.FILE_PATH}/${userId}/${_id}`;
    const newFilePath = `${filePath}.${ext}`;
    fs.rename(filePath, newFilePath, () => {});
    return res.sendFile(newFilePath, () => {
        fs.rename(newFilePath, filePath, () => {});
    });
});

module.exports = router;