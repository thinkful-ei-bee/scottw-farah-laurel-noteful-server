'use strict';

const express = require('express');

const folderRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('./logger');
const notefulService = require('./folder-service');
const xss = require('xss');

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  //MAY NEED TO CHANGE THIS
  modified: note.modified,
  content: xss(note.content),
  //MAY NEED TO CHANGE THIS
  folder_id: note.folder_id,
});

folderRouter
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
     
      if (value === null || value === undefined) {
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


folderRouter
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
  

module.exports = folderRouter;