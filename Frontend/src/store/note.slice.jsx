import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const createNote = createAsyncThunk('note/create-note', async ({ title, content }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const res = await axios.post(
            `${API_URL}/note/create-note`,
            { title, content },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(
            err.response?.data?.message || 'Error creating note'
        );
    }
}
);

export const fetchNotes = createAsyncThunk('note/get-notes', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const res = await axios.get(`${API_URL}/note/get-notes`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Error fetching notes');
    }
});

export const updateNote = createAsyncThunk('note/update', async ({ id, title, content }, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const res = await axios.put(`${API_URL}/note/update-note/${id}`, { title, content }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Error updating note');
    }
});

export const fetchNoteHistory = createAsyncThunk('note/fetchHistory', async (noteId, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token;
        const res = await axios.get(
            `${API_URL}/note/${noteId}/history`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return { noteId, history: res.data };
    } catch (err) {
        return thunkAPI.rejectWithValue(
            err.response?.data?.message || 'Error fetching history'
        );
    }
}
);

const notesSlice = createSlice({
    name: 'notes',
    initialState: {
        items: [],
        loading: false,
        error: null,
        activeNote: null,
    },
    reducers: {
        setActiveNote: (state, action) => {
            state.activeNote = action.payload;
        },
        noteUpdatedSocket: (state, action) => {
            const note = action.payload;
            const idx = state.items.findIndex((n) => n._id === note.noteId);
            if (idx >= 0) {
                const filtered = state.items.filter((n) => n._id !== note.noteId);
                state.items = [note, ...filtered]; // move updated note to top
            }
            if (state.activeNote && state.activeNote._id === note._id) {
                state.activeNote = note;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchNoteHistory.fulfilled, (state, action) => {
                if (state.activeNote && state.activeNote._id === action.payload.noteId) {
                    state.history = action.payload.history;
                }
            }).addCase(createNote.fulfilled, (state, action) => {
                state.items.unshift(action.payload); // add new note to top
            });
    },
});

export const { setActiveNote, noteUpdatedSocket } = notesSlice.actions;
export default notesSlice.reducer;
