'use strict';

const express = require('express');

const notefulRouter = express.Router();
const bodyParser = express.json();
const notefulService = require('./noteful-service');
const xss = require('xss');

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  modified: note.modified,
  content: xss(note.content),
  folder_id: note.folder_id,
});

notefulRouter
  .route('/api/folders')
  .get((req,res,next) => {

    const knexInstance = req.app.get('db');
    notefulService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders);
      })
      .catch(next);
  })

  .post(bodyParser, (req,res,next) => {
    const { id,folder_name} = req.body;
    const newFolder = { id,folder_name };

    for (const [key, value] of Object.entries(newFolder)) {
      if (key !== 'id' && (value === null || value === undefined)) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    notefulService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .location(req.originalUrl +`/${folder.id}`)
          .json(folder);
      })
      .catch(next);
  });

notefulRouter
  .route('/api/folders/:id')
  .all((req, res, next) => {
    notefulService.getFolderById(
      req.app.get('db'),
      req.params.id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: 'Folder doesn\'t exist' }
          });
        }
        res.folder = folder; // save the article for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req,res,next) => {
    return res.json(serializeFolder(res.folder));
  })

notefulRouter
  .route('/api/notes')
  .get((req,res,next) => {

    const knexInstance = req.app.get('db');
    notefulService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes);
      })
      .catch(next);
  })

  .post(bodyParser, (req,res,next) => {
    const { id, note_name, modified, folder_id, content } = req.body;
    const newNote = { id, note_name, modified, folder_id, content };

    for (const [key, value] of Object.entries(newNote)) {
     
      if ((key === 'note_name' || key === 'folder_id') && (value === null || value === undefined)) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    notefulService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(req.originalUrl +`/${note.id}`)
          .json(note);
      })
      .catch(next);
  });

notefulRouter
  .route('/api/notes/:id')
  .all((req, res, next) => {
    notefulService.getNoteById(
      req.app.get('db'),
      req.params.id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: 'Note doesn\'t exist' }
          });
        }
        res.note = note; // save the article for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })

  .get((req,res,next) => {
    return res.json(serializeNote(res.note));
  })

  .delete((req,res,next) => {

    const { id } = req.params;
    const knexInstance = req.app.get('db');
    notefulService.deleteNote(knexInstance,id)
      .then(numRowsAffected => {
        res.status(204).end();
      }
      )
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const { note_name, content, folder_id } = req.body;
    const noteToUpdate = { note_name, content, folder_id };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'request body must contain either \'note_name\', \'content\', or \'folder_id\''
        }
      });
    }

    notefulService.updateNote(
      req.app.get('db'),
      req.params.id,
      noteToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });
  
module.exports = notefulRouter;