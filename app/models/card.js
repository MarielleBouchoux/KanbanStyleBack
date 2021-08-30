const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class Card extends Model {};

Card.init({
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    color: DataTypes.TEXT,
    position: DataTypes.INTEGER,
    list_id: DataTypes.INTEGER
},{
    sequelize,
    tableName: 'card'
});

module.exports = Card;