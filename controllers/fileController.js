const fileService = require('../services/fileService');
const { User } = require('../models/userModel');
const { File } = require('../models/fileModel');
const uuid = require('uuid');
const fs = require('fs');
// const fsExtra = require('fs-extra');

const recursize = async (file) => {
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
                recursize(file);
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
        // const parentFile = await File.findOne({
        //     where: {
        //         _id: parentId
        //     }
        // });
        // if(parentFile == null) {
        //     file.path = name;
        //     await fileService.createDir(file);
        // }
        // else {
        //     file.path = `${parentFile.path}/${name}`;
        //     await fileService.createDir(file);
        //     // parentFile.childs.push(file.id);
        // }
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
        // await new fileService(dir).createDir();
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
        // const parentDir = await File.findOne({
        //     where: {
        //         userId,
        //         _id: parentId
        //     }
        // });
        // let path;
        // if(parentDir != null) {
        //     path = `${process.env.FILE_PATH}/${userId}/${parentDir.path}/${file.name}`
        // }
        // else {
        //     path = `${process.env.FILE_PATH}/${userId}/${file.name}`
        // }
        // if(fs.existsSync(path)) {
        //     return res.status(400).json({message: 'File already exists!'});
        // }
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
        // let childFilePath;
        // if(childFile.parentId == userId) {
        //     childFilePath = `${process.env.FILE_PATH}/${userId}/${childFile.name}`
        // }
        // else {
        //     if(childFile.type === 'dir') {
        //         childFilePath = `${process.env.FILE_PATH}/${userId}/${childFile.path}`
        //     }
        //     else {
        //         childFilePath = `${process.env.FILE_PATH}/${userId}/${childFile.path}/${childFile.name}`
        //     }
        // }
        // const parentFilePath = `${process.env.FILE_PATH}/${userId}/${parentFile.path}/${childFile.name}`
        // fs.rename(childFilePath, parentFilePath, () => {
        //     console.log('Success');
        // });
        const file = await File.update({
            parentId: parentFile._id,
            // path: parentFile.path
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
    // async updateFolderPath(req, res) {
    //     const {childFile, parentFile} = req.body;
    //     const {userId} = req.user;
    //     const srcFolder = `${process.env.FILE_PATH}/${userId}/${childFile.path}`;
    //     const destFolder = `${process.env.FILE_PATH}/${userId}/${parentFile.path}/${childFile.name}`;
    //     await fsExtra.move(srcFolder, destFolder);

    //     const childs = await File.findAll({
    //         where: {
    //             parentId: childFile._id
    //         }
    //     });
    //     console.log(childs.data);
    //     parentFile.path += '/' + childFile.path
    //     const file = await File.update({
    //         parentId: parentFile._id,
    //         path: parentFile.path
    //     }, {
    //         where: {
    //             _id: childFile._id
    //         }
    //     });
    //     return res.json({message: 'xui'});
    // }
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
            recursize(file);
        }
        // if(type === 'dir') {
        //     fs.rmdirSync(`${process.env.FILE_PATH}/${userId}/${path}`, {
        //         recursive: true
        //     });
        // }
        // else {
        //     if(path == null) {
        //         fs.unlinkSync(`${process.env.FILE_PATH}/${userId}/${name}`);
        //     }
        //     else {
        //         fs.unlinkSync(`${process.env.FILE_PATH}/${userId}/${path}/${name}`);
        //     }
        // }
        return res.json(deletedFile);
    }
    async renameFile(req, res) {
        const {file, newName} = req.body;
        const {userId} = req.user;
        // let filePath = '';
        // if(file.path) {
        //     if(file.path.indexOf('d') !== -1) {
        //         filePath = file.path.split('/');
        //         let someVariable = filePath.pop();
        //         filePath += `/${newName}`;
        //     }
        //     else {
        //         filePath = newName;
        //     }
        // }
        let type;
        if(file.type === 'dir') {
            type = 'dir';
        } else {
            type = newName.split('.').pop();
        }
        await File.update({
            name: newName,
            type
            // path: `${filePath}`
        }, {
            where: {
                _id: file._id,
                userId
            }
        });
        // file.name = newName;
        // console.log(file, newName);

        // if(file.type === 'dir') {
        //     const oldFilePath = `${process.env.FILE_PATH}/${userId}/${file.path}`;
        //     let newFilePath = file.path.split('/');
        //     let someVariable = newFilePath.pop();
        //     newFilePath += `${process.env.FILE_PATH}/${userId}/${newName}`;
        //     fs.rename(oldFilePath, newFilePath, () => {
        //         console.log('1Success!');
        //     });
        // }
        // else {
        //     if(file.path) {
        //         const oldFilePath = `${process.env.FILE_PATH}/${userId}/${file.path}/${file.name}`;
        //         const newFilePath = `${process.env.FILE_PATH}/${userId}/${file.path}/${newName}`;
        //         fs.rename(oldFilePath, newFilePath, () => {
        //             console.log('2Success!');
        //         });
        //     }
        //     else {
        //         console.log(file);
        //         const oldFilePath = `${process.env.FILE_PATH}/${userId}/${file.name}`;
        //         const newFilePath = `${process.env.FILE_PATH}/${userId}/${newName}`;
        //         console.log(oldFilePath, newFilePath);
        //         fs.rename(oldFilePath, newFilePath, () => {
        //             console.log('3Success!');
        //         });
        //     }
        // }
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
            // console.log(value);
            // console.log(req.body[key]);
            const fileId = uuid.v4();
            const dirArr = req.body[key].split('/');
            // parentId = dirArr.map(dir => {
            //     const findDir = File.findOne({
            //         where: {
            //             name: dir,
            //             parentId,
            //             type: 'dir'
            //         }
            //     }).then(res => {
            //         if(res !== null) {
            //             parentId = findDir._id;
                        
            //         }
            //     });
            // });
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
            // parentId = await dirArr.map(async dir => {
                // const dirId = uuid.v4();
                // // console.log(parentId);
                // const findDir = await File.findOne({
                //     where: {
                //         name: dir,
                //         parentId
                //     }
                // });
                // if(findDir === null) {
                //     const createdDir = await File.create({
                //         name: dir,
                //         type: 'dir',
                //         parentId,
                //         userId,
                //         _id: dirId
                //     });
                //     parentId = dirId;
                //     return parentId;
                // } else {
                //     parentId = findDir._id;
                //     // console.log(parentId);
                //     return parentId;
                // }
                // // return parentId;
            // });
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
                // return res.json(createdFile);
            }
            parentId = req.body.parentId;
        }
        //     const fileId = uuid.v4();
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