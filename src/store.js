const { v4: uuid } = require('uuid');

const bookmarks = [
     {
       id: uuid(),
       title: 'Google',
       url: 'http://www.google.com',
       rating: '3',
       description: 'Internet-related services and products.'
     },
     {
       id: uuid(),
       title: 'Thinkful',
       url: 'http://www.thinkful.com',
       rating: '5',
       description: '1-on-1 learning to accelerate your way to a new high-growth tech career!'
     },
     {
       id: uuid(),
       title: 'Github',
       url: 'http://www.github.com',
       rating: '4',
       description: 'brings together the world\'s largest community of developers.'
     }
  ];

 module.exports = {bookmarks}