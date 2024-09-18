import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import './ExercisePage.css';

const ExercisePage = () => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [exercises, setExercises] = useState([]);
  const [editingExercise, setEditingExercise] = useState(null);
  const { user } = useAuthContext();
  
  const token = user?.token;

  useEffect(() => {
    if (!token) {
      console.error('No token found');
      return;
    }

    const fetchExercises = async () => {
      try {
        const response = await fetch('https://reahabbackend1.onrender.com/api/userexercise/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch exercises');
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      console.error('No token found');
      return;
    }

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      const response = editingExercise
        ? await fetch(`https://reahabbackend1.onrender.com/api/userexercise/${editingExercise}`, {
            method: 'PUT',
            headers: requestHeaders,
            body: JSON.stringify({ name, duration, repetitions }),
          })
        : await fetch('https://reahabbackend1.onrender.com/api/userexercise/', {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify({ name, duration, repetitions }),
          });

      if (!response.ok) throw new Error(`Failed to ${editingExercise ? 'update' : 'create'} exercise`);
      const result = await response.json();
      
      if (editingExercise) {
        setExercises(exercises.map((exercise) => (exercise._id === editingExercise ? result : exercise)));
      } else {
        setExercises([...exercises, result]);
      }
      resetForm();
    } catch (error) {
      console.error(`Error ${editingExercise ? 'updating' : 'creating'} exercise:`, error);
    }
  };

  const handleDelete = async (id) => {
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`https://reahabbackend1.onrender.com/api/userexercise/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete exercise');
      setExercises(exercises.filter((exercise) => exercise._id !== id));
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleEdit = (exercise) => {
    setName(exercise.name);
    setDuration(exercise.duration);
    setRepetitions(exercise.repetitions);
    setEditingExercise(exercise._id);
  };

  const resetForm = () => {
    setName('');
    setDuration('');
    setRepetitions('');
    setEditingExercise(null);
  };

  if (!user) {
    return <p>Please log in to view this page.</p>;
  }

  return (
    <div className="exercise-page-container">
      <h1>{editingExercise ? 'Update Exercise' : 'Add Your Own Exercise'}</h1>
      <form onSubmit={handleSubmit} className="exercise-form">
        <div className="form-group">
          <label htmlFor="exercise-name">Name:</label>
          <input
            id="exercise-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-duration">Duration:</label>
          <input
            id="exercise-duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-repetitions">Repetitions:</label>
          <input
            id="exercise-repetitions"
            type="text"
            value={repetitions}
            onChange={(e) => setRepetitions(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          {editingExercise ? 'Update Exercise' : 'Add Exercise'}
        </button>
        {editingExercise && (
          <button type="button" className="cancel-button" onClick={resetForm}>Cancel</button>
        )}
      </form>
      <h2>Existing Exercises</h2>
      <div className="exercise-list">
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <div key={exercise._id} className="exercise-card">
              <h3>{exercise.name}</h3>
              <p>Duration: {exercise.duration}</p>
              <p>Repetitions: {exercise.repetitions}</p>
              <button onClick={() => handleDelete(exercise._id)} className="delete-button">Delete</button>
              <button onClick={() => handleEdit(exercise)} className="edit-button">Edit</button>
            </div>
          ))
        ) : (
          <p>No exercises found. Add your first exercise!</p>
        )}
      </div>
    </div>
  );
};

export default ExercisePage;
