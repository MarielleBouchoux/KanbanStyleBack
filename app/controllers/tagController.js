const { Tag, Card } = require('../models');
const { Op } = require('sequelize');
const sanitizeHtml = require('sanitize-html');

module.exports = {

    getAllTags: async (request, response) => {
        try {
            const tags = await Tag.findAll({
                order: [
                    ['name', 'ASC']
                ]
            });
            response.json(tags);
        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }

    },

    getOneTag: async (request, response, next) => {
        try {
            const id = parseInt(request.params.id, 10);
            if (isNaN(id)) {
                return next();
            }

            const tag = await Tag.findByPk(id);

            if (!tag) {
                return next();
            }

            response.json(tag);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    },

    createTag: async (request, response) => {

        try {

            const data = request.body;

            const errors = [];

            if (!data.name) {
                errors.push(`name can't be empty`);
            } else if (data.name.length < 3) {
                errors.push(`name must have at least 3 caracters`);
            }

            const tagExists = await Tag.findOne({
                where: {
                    name: data.name
                }
            });

            if (tagExists) {
                errors.push(`This name of tag is already in use`);
            }

            if (errors.length > 0) {
                return response.status(400).json({ errors });
            }

            //On assaini les valeurs texte
            data.name = sanitizeHtml(data.name);

            const tag = await Tag.create(data);
            response.status(201).json(tag);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }

    },

    updateTag: async (request, response, next) => {
        try {

            const id = parseInt(request.params.id, 10);

            if (isNaN(id)) {
                return next();
            }

            const tag = await Tag.findByPk(id);

            if (!tag) {
                return next();
            }

            const data = request.body;

            const errors = [];

            if (typeof data.name !== 'undefined') {
                if (data.name === '') {
                    errors.push(`name can't be empty`);
                } else if (data.name.length < 3) {
                    errors.push(`name must have at least 3 caracters`);
                }
            }

            if (data.name) {
                const tagExists = await Tag.findOne({
                    where: {
                        id: {
                            [Op.ne]: id
                        },
                        name: data.name
                    }
                });

                if (tagExists) {
                    errors.push(`This name of tag is already in use on another tag`);
                }
            }

            if (errors.length > 0) {
                return response.status(400).json({ errors });
            }


            //On assaini les valeurs texte
            data.name = sanitizeHtml(data.name);

            const tagSaved = await tag.update(data);

            response.json(tagSaved);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    },

    deleteTag: async (request, response, next) => {

        try {

            const id = parseInt(request.params.id, 10);

            if (isNaN(id)) {
                return next();
            }

            const tag = await Tag.findByPk(id);

            if (!tag) {
                return next();
            }

            await tag.destroy();
            response.status(204).json();
        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    },

    associateTagToCard: async (request, response, next) => {
        try {
            // On doit r??cup??rer une instance de la carte
            // On reprend la m??me chose que dans le controller card avec la methode getOneCard
            const id = parseInt(request.params.id, 10);
            if (isNaN(id)) {
                return next();
            }

            let card = await Card.findByPk(id);

            if (!card) {
                return next();
            }

            // On doit rattacher un tag a cette instance avec la m??thode addTag
            // On r??cup??re l'id du tag et on le v??rifie
            const tagId = parseInt(request.body.tag_id, 10);

            if (isNaN(tagId)) {
                return next();
            }

            const tag = await Tag.findByPk(tagId);

            if (!tag) {
                return next();
            }

            // Maintenant on peut rattacher le tag ?? la carte
            // On a pas besoin de v??rifier que le tag est d??j?? associ?? ou non ?? la carte, c'est sequelize qui s'en charge
            // Et ici on a rien a r??cup??r??
            await card.addTag(tag);
            // Cela va g??n??rer une requ??te SQL qui va ajouter une association en tre card et tag dans card_has_tag
            // On a rien a r??cup??rer

            // Par contre il ne met pas ?? jour l'instance de carte (card). C'est un peu idiot mais c'est comme ??a.
            // On y ajoute la r??cup??ration des tags
            card = await Card.findByPk(id, {
                include: 'tags'
            });

            response.json(card);
        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    },

    dissociateTagFromCard: async (request, response, next) => {

        try {
            // Meme principe on r??cup??re la carte
            const card_id = parseInt(request.params.card_id, 10);

            if (isNaN(card_id)) {
                return next();
            }

            let card = await Card.findByPk(card_id);

            if (!card) {
                return next();
            }

            // on r??cup??re le tag
            const tag_id = parseInt(request.params.tag_id, 10);

            if (isNaN(tag_id)) {
                return next();
            }

            
            let tag = await Tag.findByPk(tag_id);

            if (!tag) {
                return next();
            }
            

            // on s??pare les 2
            // On peut soit utiliser une instance soit un id directement
            //await card.removeTag(tag_id);
            await card.removeTag(tag);

            card = await Card.findByPk(card_id, {
                include: 'tags'
            });

            response.json(card);
        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    }

}