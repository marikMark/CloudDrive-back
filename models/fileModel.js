const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const File = sequelize.define('file', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    _id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    accessLink: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: true,
        defaultValue: ''
    },
    size: {
        type: DataTypes.INTEGER,
        unique: false,
        allowNull: true,
        defaultValue: 0
    },
    path: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: true
    },
    userId: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
    parentId: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: true
    },
});

module.exports = {
    File
}