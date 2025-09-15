const express = require('express');
const noteRouter = express.Router();
const { createNote, getNote, listNotes, updateNote, deleteNote, getHistory } = require('../controller/note.controller');
const { protect } = require('../middleware/auth.middleware');

noteRouter.post('/create-note', protect, createNote);
noteRouter.get('/get-notes', protect, listNotes);
noteRouter.get('/get-note-by-id/:id', protect, getNote);
noteRouter.put('/update-note/:id', protect, updateNote);
noteRouter.delete('/delete-note/:id', protect, deleteNote);
noteRouter.get('/:noteId/history', protect, getHistory);

module.exports = noteRouter;
