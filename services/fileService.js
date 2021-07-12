const fs = require('fs');

class FileService {
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