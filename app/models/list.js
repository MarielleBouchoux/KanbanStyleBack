// Les constantes de types de Sequelize sont à la fois disponible sur l'objet de base de sequelize, et dans un sous objet DataTypes
// La décomposition d'un objet permet de ne récupérer que les outils nécessaire au script courant. La méméoire vive vous dira merci !
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

class List extends Model {};

List.init({
    // Description des propriétés du model
    // On peut fourni soir un string avec le type de champ, soit un objet afin de définir plus de détail sur la propriété.
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    position: DataTypes.INTEGER
},{
    // Informations nécessaires et optionnelles pour le bon fonctionnement du modèle
    // Obligatoire : le connecteur permettant de communiquer avec PG
    sequelize,
    // Optionnel : Le nom de la table (par défaut c'est le nom de la classe, donc avec une majuscule)
    tableName: 'list'
});

module.exports = List;