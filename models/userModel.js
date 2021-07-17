const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    ipAddress: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
});

module.exports = {
    User
}