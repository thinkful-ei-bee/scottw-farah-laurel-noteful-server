'use strict';

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const noteService = require('../src/note-service')

describe.skip(`Noteful Notes Endpoint`, function() {
  let db 

  let testNotes = [
    {
      note_name: 'Note 1!',
      modified: new Date('1919-12-22T16:28:32.615Z'),
      folder_id: 1,
      content: 'Note 1 content'
    },
    {
      note_name: 'Note 2!',
      modified: new Date('1919-12-22T16:28:32.615Z'),
      folder_id: 2,
      content: 'Note 2 content'
    },
    {
      note_name: 'Note 3!',
      modified: new Date('1919-12-22T16:28:32.615Z'),
      folder_id: 3,
      content: 'Note 3 content'
    },
  ]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))

  beforeEach('insert notes', () => {
    return db
      .into('notes')
      .insert(testNotes);
  });

  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })
  }) 
})