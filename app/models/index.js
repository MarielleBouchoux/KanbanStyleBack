const List = require('./list');
const Card = require('./card');
const Tag = require('./tag');

// Gestion des associations entre les différents modèles
List.hasMany(Card, {
    // De base sequelize, il a des options par défaut, mais nous on ne veut pas les utiliser
    as: 'cards',
    foreignKey: 'list_id'
});

Card.belongsTo(List, {
    as: 'list',
    foreignKey: 'list_id'
});

Card.belongsToMany(Tag, {
    as: 'tags',
    through: 'card_has_tag',
    foreignKey: 'card_id',
    otherKey: 'tag_id',
    // Comme on n'a pas implémenté de colonne updated_at dans la table d'association, il faut désactiver les timestamps (created_at et updated_at) dans l'association de sequelize. Qu'il ne s'occupe non plus de created_at, n'est pas un souci car la date est créer du côté de la BDD.
    timestamps: false
});

Tag.belongsToMany(Card, {
    as: 'cards',
    through: 'card_has_tag',
    foreignKey: 'tag_id',
    otherKey: 'card_id',
    timestamps: false
});

module.exports = { List, Card, Tag };