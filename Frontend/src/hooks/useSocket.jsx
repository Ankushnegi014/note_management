import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { noteUpdatedSocket } from '../store/note.slice';
const URI = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'

export default function useSocket() {
  const token = `Bearer ${localStorage.getItem('token')}`;
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(URI, { auth: { token }, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('note-updated', (note) => {
      console.log("updated note",note)
      dispatch(noteUpdatedSocket(note));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, dispatch]);

  const joinNote = (noteId) => {
    console.log('join-note', noteId);
    socketRef.current?.emit('join-note', { noteId });
  };

  const leaveNote = (noteId) => {
    console.log('leave-note', noteId);
    socketRef.current?.emit('leave-note', { noteId });
  };

  return { joinNote, leaveNote, socket: socketRef.current };
}
