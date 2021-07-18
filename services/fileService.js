const fs = require('fs');
const path = require('path');

class FileService {
    createDir(file) {
        const filePath = `/app/static/${file.userId}`;
        fs.mkdirSync(filePath);
    }
    uploadFile(file) {
        const filePath = `/app/static/${file.userId}/${file._id}`;
        file.mv(filePath);
    }
    removeFile(file) {
        const filePath = `/app/static/${file.userId}/${file._id}`;
        fs.unlinkSync(filePath);
    }
}

module.exports = new FileService();