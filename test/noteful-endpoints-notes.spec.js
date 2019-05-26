'use strict';

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('Noteful Notes Endpoints', function() {

  const testNotesArray = [
    {
      id: 1,
      note_name: "DogsNote",
      modified: '2019-01-03T00:00:00.000Z',
      folder_id: 1,
      content: "Dogs dogs"
    },
    {
      id: 2,
      note_name: "CatsNote",
      modified: "2018-08-15T23:00:00.000Z",
      folder_id: 2,
      content: "Cats cats"
    },
    {
      id: 3,
      note_name: "PigsNote",
      modified: "2018-03-01T00:00:00.000Z",
      folder_id: 3,
      content: "Pigs pigs"
    }
  ];

  const testFoldersArray = [
    {
      id: 1,
      folder_name: "Dogs",
    },
    {
      id: 2,
      folder_name: "Cats",
    },
    {
      id: 3,
      folder_name: "Pigs",
    },
    {
      id: 4,
      folder_name: "Tigers",
    }
  ];

  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))


  context('Given there are notes in the database', () => {
    const testNotes = testNotesArray;
    const testFolders = testFoldersArray;
    
    beforeEach('insert notes', () => {

      return db 
        .into('folders')
        .insert(testFolders)
        .then(() => {
          return db
          .into('notes')
          .insert(testNotes);
        });
    });

    
    it('GET /api/notes:id responds with 200 and correct note', () => {

      return supertest(app)
        .get('/api/notes/1')
        .expect(200, testNotes[0]);
    });
  
    
    it('GET /api/notes responds with 200 and all of the notes', () => {
      return supertest(app)
        .get('/api/notes')
        .expect(200, testNotes);
    });
  });


  describe('POST /api/notes', () => {
    it('creates a note, responding with 201 and the new note',  function() {

      const newFolder = {
        id: 3,
        folder_name: 'Pigs',
      };

      const newNote = {
        id: 4,
        note_name: "GoatNote",
        modified: "2018-03-01T00:00:00.000Z",
        folder_id: 3,
        content: "Goat goat"
      };

      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .then(() => {
          return supertest(app)
          .post('/api/notes')
          .send(newNote)
          .expect(201)
          .expect(res => {
            expect(res.body.note_name).to.eql(newNote.note_name);
            expect(res.body.modified).to.eql(newNote.modified);
            expect(res.body.folder_id).to.eql(newNote.folder_id);
            expect(res.body.content).to.eql(newNote.content);
            expect(res.body).to.have.property('id');
            expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
          })
          .then(postRes =>
            supertest(app)
              .get('/api/notes/' + postRes.body.id )
              .expect(postRes.body) 
          );
        });
    });

    it('responds with 400 and an error message when the \'note_name\' is missing', () => {
      return supertest(app)
        .post('/api/notes')
        .send({
          id: 4,
          modified: "2018-03-01T00:00:00.000Z",
          folder_id: 3,
          content: "Goat goat"
        })
        .expect(400, {
          error: { message: 'Missing \'note_name\' in request body' }
        });
    });

    it('responds with 400 and an error message when the \'folder_id\' is missing', () => {
      return supertest(app)
        .post('/api/notes')
        .send({
          id: 4,
          note_name: "GoatNote",
          modified: "2018-03-01T00:00:00.000Z",
          content: "Goat goat"
        })
        .expect(400, {
          error: { message: 'Missing \'folder_id\' in request body' }
        });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    context('Given there are notes in the database', () => {
      
      const testNotes = testNotesArray;
      const testFolders = testFoldersArray;

      beforeEach('insert notes', () => {

        return db 
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
            .into('notes')
            .insert(testNotes);
          });
      });
  
      it('responds with 204 and removes the note', () => {
        const idToRemove = 2;
        const expectedNotes = testNotes.filter(note => note.id !== idToRemove);
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/notes')
              .expect(expectedNotes)
          );
      });

      context('Given no notes', () => {
        it('responds with 404', () => {
          const noteId = 123456;
          return supertest(app)
            .delete(`/api/notes/${noteId}`)
            .expect(404, { error: { message: 'Note doesn\'t exist' } });
        });
      });
    });
  });

  describe(`PATCH /api/notes/:id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const id = 123456;
        return supertest(app)
          .patch(`/api/notes/${id}`)
          .expect(404, { error: { message: `Note doesn't exist` }  });
      });
    });
    context('Given there are notes in the database', () => {
      const testNotes = testNotesArray;
      const testFolders = testFoldersArray;

      beforeEach('insert notes', () => {

        return db 
          .into('folders')
          .insert(testFolders)
          .then(() => {
            return db
            .into('notes')
            .insert(testNotes);
          });
      });

      it('responds with 204 and updates the note', () => {
        const idToUpdate = 2
        const updateNote = {
          note_name: "GoatNote",
          folder_id: 3,
          content: "Goat goat"
        };
        const expectedNote = {
          ...testNotes[idToUpdate - 1],
          ...updateNote
        };
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .send(updateNote)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)
              .expect(expectedNote)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `request body must contain either 'note_name', 'content', or 'folder_id'`
            }
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateNote = {
          note_name: 'updated note name',
        }
        const expectedNote = {
          ...testNotes[idToUpdate - 1],
          ...updateNote
        }

        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .send({
            ...updateNote,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)
              .expect(expectedNote)
          );
      });


    });
  });

});