const { User } = require('../models/userModel');
const { File } = require('../models/fileModel');
const uuid = require('uuid');
const { mkdir } = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const FileService = require('../services/fileService');

class AuthController {
    async checkUser(req, res) {
        const ipAddress = req.ip.split(':').pop();
        const userId = uuid.v4();

        const candidate = await User.findOne({where: {ipAddress}});
        if(candidate) {
            const token = jwt.sign({userId: candidate.userId}, process.env.SECRET_KEY, {expiresIn: '1w'});
            return await res.json({user: candidate, token});
        }

        const token = jwt.sign({userId: userId}, process.env.SECRET_KEY, {expiresIn: '1w'});
        const user = await User.create({ipAddress, userId});
        FileService.createDir(user);

        return res.json({user, token});
    }
}

module.exports = new AuthController();