const Note = require('../model/note.model');
const History = require('../model/history.model');
const { io } = require('../index');

module.exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });

    const owner = req.user._id;
    const permissions = [{ user: owner, access: 'owner' }];

    const note = await Note.create({
      title,
      content,
      owner,
      permissions
    });
    await History.create({ note: note._id, user: owner, content, titleSnapshot: title });
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};

module.exports.listNotes = async (req, res) => {
  try {
    const q = req.query.q || '';
    const regex = new RegExp(q, 'i');
    const userId = req.user._id;

    const notes = await Note.find({
      title: regex
    }).sort({ updated_at: -1 }).limit(200);

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};

module.exports.getNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;
    const note = await Note.findById(noteId).lean();
    if (!note) return res.status(404).json({ error: 'not found or no access' });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};

module.exports.updateNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;
    const { title, content } = req.body;
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ error: 'not found' });
    const updated = await Note.findOneAndUpdate(
      { _id: noteId },
      {
        $set: { title: title ?? note.title, content: content ?? note.content },
      },
      { new: true }
    );
    await History.create({ note: noteId, user: userId, content: updated.content, titleSnapshot: updated.title });
    const toTrim = await History.find({ note: noteId }).sort({ createdAt: -1 }).skip(10).select('_id').lean();
    if (toTrim.length) {
      const ids = toTrim.map(h => h._id);
      await History.deleteMany({ _id: { $in: ids } });
    }
    global.io.to(`note:${noteId}`).emit('note-updated', {
      noteId,
      title: updated.title,
      content: updated.content,
      updated_at: updated.updated_at,
      user: userId
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};

module.exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ error: 'not found' });
    const p = (note.permissions || []).find(x => x.user.toString() === userId.toString());
    if (p.access !== 'owner') return res.status(403).json({ error: 'only owner can delete' });

    await Note.deleteOne({ _id: noteId });
    await History.deleteMany({ note: noteId });

    global.io.to(`note:${noteId}`).emit('note-deleted', { noteId });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};

module.exports.getHistory = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const history = await History.find({ note: noteId }).sort({ createdAt: -1 }).limit(10).populate('user', 'username email');
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};
