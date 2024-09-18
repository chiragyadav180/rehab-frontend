import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import ExercisePage from './pages/ExercisePage';
import ExerciseDetailsPage from './pages/ExerciseDetailsPage';
import ProgressHistoryPage from './pages/ProgressHistoryPage';
import Signup from './pages/Signup';
import Login from './pages/Login';

function App() {
  const { user } = useAuthContext();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route 
          path="/" 
          element={user ? <HomePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/signup" 
          element={!user ? <Signup /> : <Navigate to="/" />} 
        />
        <Route 
          path="/program/:id" 
          element={user ? <ExerciseDetailsPage />: <Navigate to="/login" />} 
        />
        <Route 
          path="/history/:programId" 
          element={<ProgressHistoryPage />} 
        />
        <Route 
          path="/exercise" 
          element={user ? <ExercisePage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
