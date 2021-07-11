const fs = require('fs');
// const { File } = require('../models/fileModel');

class FileService {
    uploadFile(file) {
        const filePath = `${process.env.FILE_PATH}/${file.userId}/${file._id}`;
        file.mv(filePath);
    }
    removeFile(file) {
        const filePath = `${process.env.FILE_PATH}/${file.userId}/${file._id}`;
        // try {
            fs.unlinkSync(filePath);
        // } catch(e) {
            // console.log(e);
        // }
    }
}

module.exports = new FileService();