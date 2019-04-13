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

  // before('clean the table', () => db('folders').truncate());

  // afterEach('cleanup', () => db('folders').truncate());

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

      // eslint-disable-next-line no-undef
      return supertest(app)
        .get('/api/folders/1')
        .expect(200, testFolders[0]);
      // TODO: add more assertions about the body
    });
  
    
    it('GET /api/folders responds with 200 and all of the folders', () => {
      // eslint-disable-next-line no-undef
      return supertest(app)
        .get('/api/folders')
        .expect(200, testFolders);
      // TODO: add more assertions about the body
    });
  });


  describe('POST /api/folders', () => {
    it('creates a folder, responding with 201 and the new folder',  function() {

      const newFolder = {
        id : 13,
        folder_name: 'PostTest',
      };
      
      // eslint-disable-next-line no-undef
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
          // eslint-disable-next-line no-undef
          supertest(app)
            .get('/api/folders/' + postRes.body.id )
            .expect(postRes.body) 
        );
    });

    it('responds with 400 and an error message when the \'folder_name\' is missing', () => {
      // eslint-disable-next-line no-undef
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

  context('Given no folders', () => {
    it('responds with 404', () => {
      const folderId = 123456;
      // eslint-disable-next-line no-undef
      return supertest(app)
        .delete(`/api/folders/${folderId}`)
        .expect(404, { error: { message: 'Folder doesn\'t exist' } });
      });
    });
  });

  // describe(`PATCH /api/folders/:id`, () => {
  //   context(`Given no folders`, () => {
  //     it(`responds with 404`, () => {
  //       const id = 123456;
  //       return supertest(app)
  //         .patch(`/api/folders/${id}`)
  //         .expect(404, { error: { message: `Folder doesn't exist` }  });
  //     });
  //   });
  //   context('Given there are folders in the database', () => {
  //     const testFolders = testFoldersArray;

  //     beforeEach('insert folders', () => {
  //       return db
  //         .into('folders')
  //         .insert(testFolders)
  //     });

  //     it('responds with 204 and updates the folder', () => {
  //       const idToUpdate = 2
  //       const updateFolder = {
  //         url: 'testurl.com',
  //         description: 'test description',
  //         rating: 4,
  //       };
  //       const expectedBookmark = {
  //         ...testBookmarks[idToUpdate - 1],
  //         ...updateBookmark
  //       };
  //       return supertest(app)
  //         .patch(`/api/bookmarks/${idToUpdate}`)
  //         .send(updateBookmark)
  //         .expect(204)
  //         .then(res => 
  //           supertest(app)
  //             .get(`/api/bookmarks/${idToUpdate}`)
  //             .expect(expectedBookmark)
  //         );
  //     });

  //     it(`responds with 400 when no required fields supplied`, () => {
  //       const idToUpdate = 2;
  //       return supertest(app)
  //         .patch(`/api/bookmarks/${idToUpdate}`)
  //         .send({ irrelevantField: 'foo' })
  //         .expect(400, {
  //           error: {
  //             message: `request body must contain either 'folder_name', 'url', 'rating', or 'description'`
  //           }
  //         });
  //     });

  //     it(`responds with 204 when updating only a subset of fields`, () => {
  //       const idToUpdate = 2
  //       const updateBookmark = {
  //         folder_name: 'updated bookmark folder_name',
  //       }
  //       const expectedBookmark = {
  //         ...testBookmarks[idToUpdate - 1],
  //         ...updateBookmark
  //       }

  //       return supertest(app)
  //         .patch(`/api/bookmarks/${idToUpdate}`)
  //         .send({
  //           ...updateBookmark,
  //           fieldToIgnore: 'should not be in GET response'
  //         })
  //         .expect(204)
  //         .then(res =>
  //           supertest(app)
  //             .get(`/api/bookmarks/${idToUpdate}`)
  //             .expect(expectedBookmark)
  //         );
  //     });


  //   });
  // });
