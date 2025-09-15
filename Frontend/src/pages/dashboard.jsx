import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotes, setActiveNote, updateNote, fetchNoteHistory, createNote, noteUpdatedSocket, } from '../store/note.slice';
import useSocket from '../hooks/useSocket';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items: notes, activeNote, loading, history = [] } = useSelector((s) => s.notes);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [showNewForm, setShowNewForm] = useState(false);
  const { joinNote, leaveNote } = useSocket();

  useEffect(() => {
    dispatch(fetchNotes());
  }, []);

  useEffect(() => {
    if (activeNote) {
      setDraft({ title: activeNote.title, content: activeNote.content });
      dispatch(fetchNoteHistory(activeNote._id));
      joinNote(activeNote._id);
      return () => leaveNote(activeNote._id);
    }
  }, [activeNote]);

  const handleSave = () => {
    if (!activeNote) return;
    dispatch(updateNote({ id: activeNote._id, ...draft }))
      .then((res) => {
        dispatch(noteUpdatedSocket(res.payload))
        dispatch(fetchNoteHistory(activeNote._id))
      });
  };

  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    dispatch(createNote(newNote)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setShowNewForm(false);
        setNewNote({ title: '', content: '' });
      }
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Your Notes</h2>
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            + New
          </button>
        </div>
        {loading && <p>Loading...</p>}
        <ul>
          {notes.map((note) => (
            <li
              key={note._id}
              onClick={() => dispatch(setActiveNote(note))}
              className={`p-2 cursor-pointer rounded ${activeNote?._id === note._id ? 'bg-blue-200' : 'hover:bg-gray-200'
                }`}
            >
              {note.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 flex flex-col">
        {activeNote ? (
          <>
            <input
              className="border p-2 mb-2 text-lg font-bold"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <textarea
              className="border p-2 flex-1"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            />
            <button
              onClick={handleSave}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </>
        ) : (
          <p>Select a note to edit</p>
        )}
      </div>

      {/* History Panel */}
      <div className="w-1/4 bg-gray-50 border-l p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-2">History</h2>
        {history.length === 0 && <p>No history yet</p>}
        <ul className="space-y-2">
          {history.map((h) => (
            <li key={h._id} className="p-2 border rounded bg-white">
              <p className="text-sm text-gray-600">
                {h.user?.username || 'Unknown'} —{' '}
                {new Date(h.createdAt).toLocaleString()}
              </p>
              <p className="font-semibold">{h.titleSnapshot}</p>
              <p className="text-xs truncate">{h.content}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* New Note Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-4">Create Note</h2>
            <input
              type="text"
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full border p-2 mb-2 rounded"
            />
            <textarea
              placeholder="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full border p-2 mb-2 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
