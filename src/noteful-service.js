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


  insertFolder(db, newItem) {
    return db.insert(newItem).into('folders')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
    
  },
 
};



module.exports = notefulService;
