'use strict';

const express = require('express');

const noteRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('./logger');
const noteService = require('./note-service');
const xss = require('xss');

// const serializeFolder = folder => ({
//   id: folder.id,
//   folder_name: xss(folder.folder_name)
// });

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  //MAY NEED TO CHANGE THIS
  modified: note.modified,
  content: xss(note.content),
  //MAY NEED TO CHANGE THIS
  folder_id: note.folder_id,
});

noteRouter
  .route('/api/notes')
  .get((req,res,next) => {

    const knexInstance = req.app.get('db');
    noteService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes);
      })
      .catch(next);
  })

  .post(bodyParser, (req,res,next) => {
    const { id,note_name} = req.body;
    const newNote = { id,note_name };

    for (const [key, value] of Object.entries(newNote)) {
      if (value === null || value === undefined) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    noteService.insertNote(
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

//===========
// NOTE ID
//===========
noteRouter
  .route('/api/notes/:id')
  .all((req, res, next) => {
    noteService.getNoteById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: 'Note doesn\'t exist' }
          });
        }
        res.note = note;
        next(); 
      })
      .catch(next);
  })
  .get((req,res,next) => {
    return res.json(serializeNote(res.note));
  })
  .delete((res, res, next) => {
      noteService.deleteNote(
          res.app.get('db'),
          req.params.note_id
      )
      .then(() => {
          res.status(204).end()
      })
      .catch(next)
  })
  

module.exports = noteRouter;