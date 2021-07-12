const fileService = require('../services/fileService');
const { User } = require('../models/userModel');
const { File } = require('../models/fileModel');
const uuid = require('uuid');

const recursive = async (file) => {
    const findFiles = await File.findAll({
        where: {
            parentId: file._id,
            userId: file.userId
        }
    });
    findFiles.map(async file => {
        if(file !== null) {
            await File.destroy({
                where: {
                    _id: file._id,
                    userId: file.userId
                }
            });
            if(file.type === 'dir') {
                recursive(file);
            } else {
                fileService.removeFile(file);
            }
        } else {
            console.log('The End!');
        }
    });
}

class FileController {
    async createDir(req, res) {
        const {name, type, parentId} = req.body;
        const dirId = uuid.v4();
        const findDir = await File.findOne({
            where: {
                name,
                parentId
            }
        });
        if(findDir === null) {
            const dir = await File.create({
                _id: dirId,
                name,
                type,
                parentId,
                userId: req.user.userId
            });
            return res.json(dir);
        } else {
            return res.json({message: 'dirExist'});
        }
    }
    async getFiles(req, res) {
        const {userId} = req.user;
        const parentId = req.params.id || userId;
        const files = await File.findAll({
            where: {
                userId,
                parentId
            }
        });
        return res.json(files);
    }
    async uploadFile(req, res) {
        const {file} = req.files;
        const {parentId} = req.body;
        const {userId} = req.user;
        const type = file.name.split('.').pop();
        file._id = uuid.v4();
        file.userId = userId;
        const findFile = await File.findOne({
            where: {
                name: file.name,
                parentId
            }
        });
        if(findFile === null) {
            const uploadFile = await File.create({
                _id: file._id,
                name: file.name,
                type,
                path: '',
                parentId,
                userId,
                size: file.size
            });
            fileService.uploadFile(file);
            const findParent = await File.findOne({
                where: {
                    _id: parentId
                }
            });
            if(findParent !== null) {
                const parent = await File.update({
                    size: findParent.size + file.size
                }, {
                    where: {
                        _id: parentId
                    }
                });
            }
            return res.json(uploadFile);
        } else {
            return res.json({message: 'fileExist'});
        }
    }
    async updateFilePath(req, res) {
        const {childFile, parentFile} = req.body;
        const {userId} = req.user;
        const file = await File.update({
            parentId: parentFile._id
        }, {
            where: {
                _id: childFile._id,
                userId
            }
        });
        let parent;
        if(parentFile.hasOwnProperty('parentId')) {
            parent = await File.findOne({
                where: {
                    _id: parentFile._id
                }
            });
            const size = parent.size + childFile.size;
            await File.update({
                size
            }, {
                where: {
                    _id: parentFile._id
                }
            });
            parent = await File.findOne({
                where: {
                    _id: parentFile._id
                }
            });
        }
        else {
            parent = await File.findOne({
                where: {
                    _id: childFile.parentId
                }
            });
            console.log(parent.size, childFile.size);
            const size = parent.size - childFile.size;
            await File.update({
                size
            }, {
                where: {
                    _id: childFile.parentId
                }
            });
            parent = await File.findOne({
                where: {
                    _id: childFile.parentId
                }
            });
        }
        console.log(parent);
        return res.json(parent);
    }
    async removeFile(req, res) {
        const {_id, type} = req.body;
        const {userId} = req.user;
        const deletedFile = await File.destroy({
            where: {
                _id,
                userId
            }
        });
        if(type === 'dir') {
            const file = {
                _id,
                type,
                userId
            }
            recursive(file);
        }
        return res.json(deletedFile);
    }
    async renameFile(req, res) {
        const {file, newName} = req.body;
        const {userId} = req.user;
        let type;
        if(file.type === 'dir') {
            type = 'dir';
        } else {
            type = newName.split('.').pop();
        }
        await File.update({
            name: newName,
            type
        }, {
            where: {
                _id: file._id,
                userId
            }
        });
        return res.json(file);
    }
    async downloadFile(req, res) {
        const {_id} = req.query;
        const {userId} = req.user;
        const filePath = `${process.env.FILE_PATH}/${userId}/${_id}`;
        const findFile = await File.findOne({
            where: {
                _id,
                userId
            }
        });
        res.download(filePath, findFile.name);
    }
    async uploadFolder(req, res) {
        const files = req.files;
        let {parentId} = req.body;
        const {userId} = req.user;
        let createdDirArr = [];

        const findParentDir = await File.findOne({
            where: {
                parentId,
                userId,
                name: req.body['files[0]'].split('/').shift()
            }
        });
        if(findParentDir !== null) {
            return res.json({message: 'dirExist'});
        }
        for(const [key, value] of Object.entries(files)) {
            const fileId = uuid.v4();
            const dirArr = req.body[key].split('/');
            for(let i = 0; i < dirArr.length; i++) {
                const dirId = uuid.v4();
                const findDir = await File.findOne({
                    where: {
                        name: dirArr[i],
                        parentId
                    }
                });
                if(findDir === null) {
                    const createdDir = await File.create({
                        name: dirArr[i],
                        type: 'dir',
                        parentId,
                        userId,
                        _id: dirId
                    });
                    const parentFolder = await File.findOne({
                        where: {
                            _id: parentId
                        }
                    });
                    if(parentFolder !== null) {
                        await File.update({
                            size: parentFolder.size + createdDir.size
                        }, {
                            where: {
                                _id: parentId
                            }
                        });
                    }
                    createdDirArr.push(createdDir);
                    parentId = dirId;
                } else {
                    parentId = findDir._id;
                }
            }
            if(value.name !== '.DS_Store') {
                const createdFile = await File.create({
                    name: value.name,
                    type: value.name.split('.').pop(),
                    size: value.size,
                    _id: fileId,
                    userId,
                    parentId
                });
                const parentFolder = await File.findOne({
                    where: {
                        _id: parentId
                    }
                });
                await File.update({
                    size: parentFolder.size + value.size
                }, {
                    where: {
                        _id: parentId
                    }
                });
                value.userId = userId;
                value._id = fileId;
                fileService.uploadFile(value);
            }
            parentId = req.body.parentId;
        }
        const mostParentDir = await File.findOne({
            where: {
                _id: createdDirArr.shift()._id,
                userId
            }
        });
        return res.status(200).json(mostParentDir);
    }
}

module.exports = new FileController();