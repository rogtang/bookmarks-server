const BookmarksService = {
    getBookmarks(knex) {
        return knex.select('*').from('bookmarks')
    },
    getById(knex, id){
        return knex.select('*').from('bookmarks').where('id', id).first()
    },
    insertBookmark(knex, newBookmark) {
        return (
            knex
            .insert(newBookmark)
            .into('bookmarks')
            .returning('*')
            .then((array) => {
                return array[0];
            })
        );
    },
    deleteBookmark(knex, id) {
        return knex.from('bookmarks').where('id', id).delete()
    }
}

module.exports = BookmarksService