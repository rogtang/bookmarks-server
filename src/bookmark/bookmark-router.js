const express = require('express')
const logger = require('../logger')
//const { v4: uuid } = require('uuid');
const xss = require('xss')
//const {bookmarks} = require('../store')
const { isWebUri } = require('valid-url')
const BookmarksService = require('./bookmark-service')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  url: bookmark.url,
  title: xss(bookmark.title),
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
})

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
      const knexInstance = req.app.get('db')
      BookmarksService.getBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark))
      })
      .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { title, url, rating, description } = req.body;

        if (!title) {
          logger.error(`Title is required`);
          return res.status(400).send({
            error: { message: "'title' is required" }
          })
        }
        
        if (!url) {
          logger.error(`Url is required`);
          return res.status(400).send({
            error: { message: "'url' is required" }
          })
        }

        if (!rating) {
            logger.error(`Rating is required`);
            return res.status(400).send({
              error: { message: "'rating' is required" }
            })
          }
        
        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send({
              error: { message: "'rating' must be a number between 0 and 5" }
            })
          }
      
        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send({
              error: { message: "'url' must be a valid URL"}
            })
          }
      
      const knexInstance = req.app.get('db')
      const newBookmark = {title, url, rating, description}
      
      BookmarksService.insertBookmark(knexInstance, newBookmark)
      .then(bookmark => {
        res
        .status(201)
        .location(`/bookmarks/${bookmark.id}`)
        .json(serializeBookmark(bookmark));      
      })
      .catch(next)
      })

bookmarkRouter
    .route('/bookmarks/:bookmark_id')
    .all((req, res, next) => {
      const { bookmark_id } = req.params
      BookmarksService.getById(req.app.get('db'), bookmark_id)
        .then(bookmark => {
          if (!bookmark) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res.status(404).json({
              error: { message: `Bookmark Not Found` }
            })
          }
          res.bookmark = bookmark
          next()
        })
        .catch(next)
    })
    .get((req, res) => {
      res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
      const knexInstance = req.app.get('db')
      const { bookmark_id } = req.params;
      BookmarksService.deleteBookmark(knexInstance, bookmark_id)
      .then(numRowsAffected => {
      logger.info(`Bookmark with id ${bookmark_id} deleted.`)
      res.status(204).end()
      })
      .catch(next)
      })


module.exports = bookmarkRouter