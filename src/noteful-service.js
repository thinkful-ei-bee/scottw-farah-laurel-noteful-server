'use strict';

const notefulService = {
  getAllFolders(db) {
    return (
      db.select('*').from('folders')
    );
  },

  getFolderById(db, id) {
    return (
      db.select('*').from('folders').where('id', id).first()
    );
  },


  insertFolder(db, newFolder) {
    return db.insert(newFolder).into('folders')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
    
  },


  getAllNotes(db) {
    return (
      db.select('*').from('notes')
    );
  },

  insertNote(db, newNote) {
    return db.insert(newNote).into('notes')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getNoteById(db, id) {
    return (
      db.select('*').from('notes').where('id', id).first()
    );
  },

  deleteNote(db, id) {
    return (
      db.select('*').from('notes').where('id', id).delete()
    );
  },

  updateNote(db, id, updates) {
    return (
      db('notes')
        .where({id})
        .update(updates)
    );
  }
 
};



module.exports = notefulService;
