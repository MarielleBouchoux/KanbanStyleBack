const express = require('express');
const mainController = require('./controllers/mainController');
const listController = require('./controllers/listController');
const cardController = require('./controllers/cardController');
const tagController = require('./controllers/tagController');

const router = express.Router();

router.get('/', (req, res)=>{
    res.send(`Server is running!`)
});

router.route('/lists')
    .get(listController.getAllLists)
    .post(listController.createList);

router.route('/lists/:id')
    .get(listController.getOneList)
    .patch(listController.updateList)
    .delete(listController.deleteList);

router.route('/lists/:id/cards')
    .get(cardController.getAllCardsInList);
    

router.route('/cards')
    .post(cardController.createCard);

router.route('/cards/:id')
    .get(cardController.getOneCard)
    .patch(cardController.updateCard)
    .delete(cardController.deleteCard);

router.route('/tags')
    .get(tagController.getAllTags)
    .post(tagController.createTag);

router.route('/tags/:id')
    .patch(tagController.updateTag)
    .delete(tagController.deleteTag);

router.route('/cards/:id/tags')
    .post(tagController.associateTagToCard);

router.route('/cards/:card_id/tags/:tag_id')
    .delete(tagController.dissociateTagFromCard);

router.use(mainController.error404);

module.exports = router;