const Router = require('express');
const router = new Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth.middleware');

// POST
router.post('/file', authMiddleware, fileController.uploadFile);
router.post('/folder', authMiddleware, fileController.createDir);
router.post('/files', authMiddleware, fileController.uploadFolder);

// GET
router.get('/file/download', authMiddleware, fileController.downloadFile);
router.get(['/file', '/file/:id'], authMiddleware, fileController.getFiles);

// PUT
// router.put('/folder/move', authMiddleware, fileController.updateFolderPath);
router.put('/file/move', authMiddleware, fileController.updateFilePath);
router.put('/file/name', authMiddleware, fileController.renameFile);

// DELETE
router.delete('/file', authMiddleware, fileController.removeFile);

module.exports = router;