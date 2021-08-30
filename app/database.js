const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.PG_URL, {
    // On dit a Sequelize qu'a chaque fois que l'on va créer un model, il devra utiliser ces valeurs par défaut. On pourra les surcharger dans le model si besoin.
    define: {
        // On dit à sequelize qu'on utilise la version snakeCase plutôt que camelCase
        //underscored: true,
        // on modifie le nom des colonnes de date, qui par défaut sont en camelCase
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

module.exports = sequelize;