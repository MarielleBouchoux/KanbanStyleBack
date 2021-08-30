const { List } = require('../models/');
const { Op } = require('sequelize');
const sanitizeHtml = require('sanitize-html');

module.exports = {

    getAllLists: async (request, response) => {
        try {
            const lists = await List.findAll({
                include: {
                    all: true,
                    nested: true,
                },
                // Pour ordonner un résultat on utilise la propriété order. Celle-ci est un tableau, car on peut ordonner par plusieurs colonnes. Et ce tableau contient d'autres tableau (pas de objets) car on a besoin de définir que 2 informations, la première : la colone et la deuxième: le sens de tri. Si jamais c'est un tri sur un des "enfants" de la selection, on doit rajouter en premier l'alias de l'enfant (association)
                order: [
                    ['position', 'ASC'],
                    ['cards', 'position', 'ASC']
                ]
            });
            response.json(lists);
        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }

    },

    getOneList: async (request, response, next) => {
        try {
            const id = parseInt(request.params.id, 10);
            if (isNaN(id)) {
                // ressource inexistante
                // afin d'arrêter l'exécution de cette function et ne pas avoir de souci de double réponse avec erreur de header, on return le next()
                return next();
            }

            const list = await List.findByPk(id, {
                include: {
                    association: 'cards',
                    include: 'tags'
                }
            });

            if (!list) {
                // resource introuvable
                return next();
            }

            response.json(list);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    },

    createList: async (request, response) => {

        try {

            const data = request.body;

            // On initialise un tabeau qui contiendra les potentiels erreurs
            const errors = [];

            // On vérifie les différentes contraintes
            if (!data.name) {
                errors.push(`name can't be empty`);
            } else if (data.name.length < 3) {
                errors.push(`name must have at least 3 caracters`);
            }

            if (data.position) {
                data.position = parseInt(data.position, 10);
                if (isNaN(data.position)) {
                    errors.push(`position must be a number`);
                }
            }

            // On vérifie que la resource n'existe pas encore
            const listExists = await List.findOne({
                where: {
                    name: data.name
                }
            });

            if (listExists) {
                errors.push(`This name of list is already in use`);
            }

            // en cas d'erreurs on renvoi une erreur utilisateur
            if (errors.length > 0) {
                return response.status(400).json({ errors });
            }

            //On assaini les valeurs texte
            data.name = sanitizeHtml(data.name);

            // Si tout c'est bien passé on insère en BDD
            //! Dans un API, on renvoi toujours des données, dans le cas d'un insertion on renvoi l'entité créer enrichi avec les valeurs générés automatiquement dans la BDD. Donc onrécupère le retour de sequelize qui nous renvoi l'instance créer à partir de l'ajout en BDD
            const list = await List.create(data);
            // On en profite pour rajouter un status 201 qui précise : Requête traitée avec succès et création d’un document.
            response.status(201).json(list);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }

    },

    updateList: async (request, response, next) => {
        try {

            const id = parseInt(request.params.id, 10);

            if (isNaN(id)) {
                return next();
            }

            const list = await List.findByPk(id);

            if (!list) {
                return next();
            }

            const data = request.body;

            // On initialise un tabeau qui contiendra les potentiels erreurs
            const errors = [];

            // On vérifie les différentes contraintes
            if (typeof data.name !== 'undefined') {
                if (data.name === '') {
                    errors.push(`name can't be empty`);
                } else if (data.name.length < 3) {
                    errors.push(`name must have at least 3 caracters`);
                }
            }

            if (data.position) {
                data.position = parseInt(data.position, 10);
                if (isNaN(data.position)) {
                    errors.push(`position must be a number`);
                }
            }

            if (data.name) {
                // On vérifie que le nom reçu ne correspond pas au nom d'un autre liste que celle que l'on met à jour
                const listExists = await List.findOne({
                    where: {
                        id: {
                            [Op.ne]: id
                        },
                        name: data.name
                    }
                });

                if (listExists) {
                    errors.push(`This name of list is already in use on another list`);
                }
            }

            // en cas d'erreurs on renvoi une erreur utilisateur
            if (errors.length > 0) {
                return response.status(400).json({ errors });
            }

            // On met à jour les données si elle on été envoyé
            // Cela est particulier à la méthode PATCH
            /*if(data.name){
                list.name = data.name;
            }

            if(data.position){
                list.position = data.position;
            }*/

            // On peut mettre à jour une instance avec les méthode save() ou update().
            // Avec save() il faut d'abord mettre à jour les propriété puis les appliquer les modification avec save(). Inconvénient majeur on ne récupère pas les valeurs mise à jour automatiquement du côté de la BDD (ex: updated_at)
            // Avec update() on envoi les données en arguments de méthode et on peut récupérer l'instance mise à jour avec les champs automatique. Inconvénient on est obligé de passé toute les colonnes obligatoire, c'est à dire si le client n'a pas fourni de nom, data n'a pas de propriété name, donc lors de la requête on a un retour d'erreur comme quoi le "name" est obligatoire

            // le spread opérateur décompose l'ensemble des propriétés, en les "explosant" sépraré par des virgules.
            /*
            const obj = {prop1: "test", prop2: "truc"}
            ...obj ===> prop1: "test", prop2: "truc"
            donc si on fait
            newObj = {...obj}
            on créer une nouvelle référence qui contient exactement les même propriétés
            et cela on peut le faire avec plusieurs objet, on peut donc fusionner des objets
            */

            /*const listNewData = { ...list, ...data };
            delete listNewData.id;
            delete listNewData.updated_at;

            console.log(listNewData);*/
            // Sauf qu'en fait il prend des données partiels donc prenez ça pour plus tard ca sera toujours utile.


            //On assaini les valeurs texte
            if (data.name) 
            {data.name = sanitizeHtml(data.name);}

            const listSaved = await list.update(data);

            response.json(listSaved);

        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    },

    deleteList: async (request, response, next) => {

        try {

            const id = parseInt(request.params.id, 10);

            if (isNaN(id)) {
                return next();
            }

            const list = await List.findByPk(id);

            if (!list) {
                return next();
            }

            // on peut ou ne pas mettre le await ici, mais l'intérêt de le mettre est de catch une potentiel erreur lors de l'exécution de la requête
            await list.destroy();
            // Pour une suppression on ne renvoi rien, mais on utilise un status précisant que l'on a rien renvoyé
            response.status(204).json();
        } catch (error) {
            console.trace(error);
            response.status(500).json({ error: `Server error, please contact an administrator` });
        }
    }

}