const express = require('express')
const logger = require('../logger')
const { v4: uuid } = require('uuid');
const {bookmarks} = require('../store')
const { isWebUri } = require('valid-url')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, rating, description } = req.body;
        if (!title) {
          logger.error(`Title is required`);
          return res
            .status(400)
            .send('Invalid data');
        }
        
        if (!url) {
          logger.error(`Url is required`);
          return res
            .status(400)
            .send('Invalid data');
        }

        if (!rating) {
            logger.error(`Rating is required`);
            return res
              .status(400)
              .send('Invalid data');
          }
        
        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send(`'rating' must be a number between 0 and 5`)
          }
      
        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send(`'url' must be a valid URL`)
          }
          
      //create the new bookmark object
      const id = uuid();
      const bookmark = {
        id,
        title,
        url,
        rating,
        description
      };
      
      bookmarks.push(bookmark);
      
      logger.info(`Bookmark with id ${id} created`);
      
      res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${id}`)
        .json(bookmark);
      })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
      const { id } = req.params;
      const bookmark = bookmarks.find(bk =>bk.id == id);
  
      // make sure we found a card
      if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Bookmark Not Found');
    }
      res.json(bookmark);
    })
    .delete((req, res) => {
      const { id } = req.params;
  
      const bookmarkIndex = bookmarks.findIndex(bk => bk.id == id);
  
      if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Bookmark Not found');
    }
  
   bookmarks.splice(bookmarkIndex, 1);
  
    logger.info(`Bookmark with id ${id} deleted.`);
  
    res
      .status(204)
      .end();
    })


module.exports = bookmarkRouter