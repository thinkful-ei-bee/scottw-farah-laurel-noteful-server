'use strict';

const noteService = {
  getAllNotes(db) {
    return (
      db.select('*').from('notes')
    );
  },
  getNoteById(db, id) {
    return (
      db.select('*').from('notes').where('id', id).first()
    );
  },
  insertNote(db, newItem) {
    return db.insert(newItem).into('notes')
      .returning('*')
      .then(rows => {
        return rows[0];
      }); 
  },
  deleteNote(knex, id) {
    return knex('notes')
      .where({ id })
      .delete()
  }, 
};

module.exports = noteService;
