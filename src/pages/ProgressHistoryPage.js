
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const ProgressHistoryPage = () => {
  const { programId } = useParams();
  const [history, setHistory] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [programName, setProgramName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const token = user?.token; 

  useEffect(() => {
    if (!token) {
      setError('User is not authenticated.');
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch(`https://reahabbackend1.onrender.com/api/progress/history/${programId}`, {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch progress history');
        }
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchProgramDetails = async () => {
      try {
        const response = await fetch(`https://reahabbackend1.onrender.com/api/programs/${programId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch program details');
        }
        const data = await response.json();
        setProgramName(data.name);
        setExercises(data.exercises || []);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchHistory();
    fetchProgramDetails();
  }, [programId, token, navigate]);

  if (loading) return <p>Loading progress history...</p>;
  if (error) return <p>Error: {error}</p>;

  const getExerciseName = (exerciseId) => {
    const exercise = exercises.find(ex => ex._id === exerciseId);
    return exercise ? exercise.name : 'Unknown Exercise';
  };

  return (
    <div className="progress-history-container">
      <h2>Progress History for Program: {programName}</h2>
      {history.length === 0 ? (
        <p>No progress history available.</p>
      ) : (
        <table className="progress-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Exercises Completed</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry._id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>
                  {entry.exercisesCompleted.length > 0 ? (
                    entry.exercisesCompleted.map(e => (
                      <div key={`${e.exerciseId}-${e.completedAt}`}>
                        {getExerciseName(e.exerciseId)} (Completed At: {new Date(e.completedAt).toLocaleString()})
                      </div>
                    ))
                  ) : (
                    <p>No exercises completed.</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
};

export default ProgressHistoryPage;
