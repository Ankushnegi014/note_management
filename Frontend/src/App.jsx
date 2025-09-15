import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import AppRoutes from './app.routes.jsx';
import authReducer from './store/auth.slice.jsx';
import notesReducer from './store/note.slice.jsx';

const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
