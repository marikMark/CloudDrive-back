const fs = require('fs');

class FileService {
    createDir(file) {
        const filePath = `${process.env.FILE_PATH}/${file.userId}`;
        fs.mkdirSync(filePath);
    }
    uploadFile(file) {
        const filePath = `${process.env.FILE_PATH}/${file.userId}/${file._id}`;
        file.mv(filePath);
    }
    removeFile(file) {
        const filePath = `${process.env.FILE_PATH}/${file.userId}/${file._id}`;
        fs.unlinkSync(filePath);
    }
}

module.exports = new FileService();