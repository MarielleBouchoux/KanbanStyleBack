require('dotenv').config();
const { List, Card, Tag } = require('./app/models');

// On utilise une IIFE (Immediately Invoked Function Expression)
// Cela evite de stocker la fonction en mémoire pour ne l'exécuter qu'une fois juste après ca déclaration
(async () => {

    try {

        const lists = await Tag.findAll({
            include: {
                association: 'cards',
                include: 'tags'
            }
        });
        console.log(lists);

    } catch (error) {

        console.trace(error);

    }


})();