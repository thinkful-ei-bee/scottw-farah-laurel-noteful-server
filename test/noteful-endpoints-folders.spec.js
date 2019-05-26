'use strict';

const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('Noteful Folders Endpoints', function() {

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

  context('Given there are articles in the database', () => {
    const testFolders = testFoldersArray;
    
    beforeEach('insert folders', () => {
      return db
        .into('folders')
        .insert(testFolders);
    });

    
    it('GET /api/folders:id responds with 200 and correct folder', () => {
      return supertest(app)
        .get('/api/folders/1')
        .expect(200, testFolders[0]);
    });
  
    
    it('GET /api/folders responds with 200 and all of the folders', () => {
      return supertest(app)
        .get('/api/folders')
        .expect(200, testFolders);
    });
  });


  describe('POST /api/folders', () => {
    it('creates a folder, responding with 201 and the new folder',  function() {

      const newFolder = {
        id : 13,
        folder_name: 'PostTest',
      };
      
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(newFolder.folder_name);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
        })
        .then(postRes =>
          supertest(app)
            .get('/api/folders/' + postRes.body.id )
            .expect(postRes.body) 
        );
    });

    it('responds with 400 and an error message when the \'folder_name\' is missing', () => {
      return supertest(app)
        .post('/api/folders')
        .send({
          id: 15,
        })
        .expect(400, {
          error: { message: 'Missing \'folder_name\' in request body' }
        });
    });
  });
});