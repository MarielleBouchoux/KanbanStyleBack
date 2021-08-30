const { Card, List } = require('../models');
const { Op } = require('sequelize');
const sanitizeHtml = require('sanitize-html');

/*
Afin de faire mon controller de cartes, j'ai repris mon controller de liste et j'ai remplacer : 
    - "List" par "Card" (Attention à la casse)
    - "list" par "card"
    - "name" par "content"
Il ne me reste plus qu'a rajouter : 
    - modifier la récupération de toutes les cartes en restreignant à l'id d'une liste
    - la colonne "color" dans create et update (elle est optionnelle, on ne s'en pré-occupe pas)
    - le rattachement d'une carte dans une liste
 */

module.exports = {

    getAllCardsInList: async (request, response, next) => {
        try {
            // On vérifie toujours que l'id est bien un entier
            const listId = parseInt(request.params.id, 10);

            if (isNaN(listId)) {
                return next();
            }

            // On ajoute une vérfication que la liste de l'id fourni existe
            const list = await List.findByPk(listId);

            if (!list) {
                return next();
            }

            // Et enfin on récupère les  cartes on rajoutant un filtre sur l'id de la liste
            // Eager Loading
            /*
            const cards = await Card.findAll({
                where: {
                    list_id: listId
                },
                include: 'tags',
                order: [
                    ['position', 'ASC'],
                ]
            });*/
            // Lazy Loading
            // Méthode généré par sequelize qui est composé :
            // verbe (CRUD) + entité en majuscule et au pluriel (anglais)
            const cards = await list.getCards({
                include: 'tags',
                order: [
                    ['position', 'ASC'],
                ]
            });

            response.json(cards);
        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }

    },

    getOneCard: async (request, response, next) => {
        try {
            const id = parseInt(request.params.id, 10);
            if (isNaN(id)) {
                return next();
            }

            const card = await Card.findByPk(id, {
                include: 'tags'
            });

            if (!card) {
                return next();
            }

            response.json(card);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    },

    createCard: async (request, response) => {

        try {

            const data = request.body;

            const errors = [];

            //On se pré-occupe avant tout de vérifier que la carte est bien rattaché a une liste
            data.list_id = parseInt(data.list_id, 10);

            // On vérifie que l'id est un entier
            if (isNaN(data.list_id)) {
                errors.push(`list_id must be an integer`);
            } else {
                // Si oui on vérifie que la liste existe
                const list = await List.findByPk(data.list_id);

                if (!list) {
                    errors.push(`The list of the card does not exist`);
                }
            }

            
            
            if (!data.content) {
                errors.push(`content can't be empty`);
            } else if (data.content.length < 3) {
                errors.push(`content must have at least 3 caracters`);
            }
            

            if (data.position) {
                data.position = parseInt(data.position, 10);
                if (isNaN(data.position)) {
                    errors.push(`position must be a number`);
                }
            }

            /*const cardExists = await Card.findOne({
                where: {
                    content: data.content
                }
            });*/

            // Ici un contenu peut être dupliqué
            /*
            if (cardExists) {
                errors.push(`This content of card is already in use`);
            }
            */

            if (errors.length > 0) {
                return response.status(400).json({ errors });
            }


            //On assaini les valeurs texte
            data.content = sanitizeHtml(data.content);

            const card = await Card.create(data);
            response.status(201).json(card);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }

    },

    updateCard: async (request, response, next) => {
        try {

            const id = parseInt(request.params.id, 10);

            if (isNaN(id)) {
                return next();
            }

            const card = await Card.findByPk(id);

            if (!card) {
                return next();
            }

            const data = request.body;

            const errors = [];

            //On se pré-occupe avant tout de vérifier, si on a un list_id que cet id est valide et correspond à une liste valide
            // Lorsque l'on est dans une modification partiel (PATCH), on doit toujours vérifier qu'une propriété a été envoyé avant de vérifier cette donnée
            //! attention, il faut bien utilisé le typeof ici car les valeurs 0, undefined, '', et null sont falsy. Donc cela ne passerai pas par le test et la modification serait réellement effectué…
            if (typeof data.list_id !== 'undefined') {
                data.list_id = parseInt(data.list_id, 10);

                if (isNaN(data.list_id)) {
                    errors.push(`list_id must be an integer`);
                } else {
                    const list = await List.findByPk(data.list_id);

                    if (!list) {
                        errors.push(`The list of the card does not exist`);
                    }
                }
            }

            // On vérifie les différentes contraintes
            if (typeof data.content !== 'undefined') {
                if (data.content === '') {
                    errors.push(`content can't be empty`);
                } else if (data.content.length < 3) {
                    errors.push(`content must have at least 3 caracters`);
                }
            }

            if (data.position) {
                data.position = parseInt(data.position, 10);
                if (isNaN(data.position)) {
                    errors.push(`position must be a number`);
                }
            }

            // Ici on commente cette partie car on peut avoir plusieurs carte avec le même contenu
            /*
            if (data.content) {
                const cardExists = await Card.findOne({
                    where: {
                        id: {
                            [Op.ne]: id
                        },
                        content: data.content
                    }
                });

                if (cardExists) {
                    errors.push(`This content of card is already in use on another card`);
                }
            }
            */

            if (errors.length > 0) {
                return response.status(400).json({ errors });
            }

            //On assaini les valeurs texte
            data.content = sanitizeHtml(data.content);

            const cardSaved = await card.update(data);

            response.json(cardSaved);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    },

    deleteCard: async (request, response, next) => {

        try {

            const id = parseInt(request.params.id, 10);

            if (isNaN(id)) {
                return next();
            }

            const card = await Card.findByPk(id);

            if (!card) {
                return next();
            }

            await card.destroy();
            response.status(204).json();
        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    }

}