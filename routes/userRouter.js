const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/login', userController.checkUser);
router.get('/check', authMiddleware, userController.checkUser);

module.exports = router;