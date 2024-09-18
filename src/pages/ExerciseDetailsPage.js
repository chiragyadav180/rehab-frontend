import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ExerciseList from '../components/ExerciseList';
import { useAuthContext } from '../hooks/useAuthContext';
import './ExerciseDetailsPage.css'
const ExerciseDetailsPage = () => {
  const { id } = useParams(); // Program ID
  const { user } = useAuthContext(); // Get user from context
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);

  // Fetch program details and initialize progress if necessary
  useEffect(() => {
    if (!user || !id) {
      navigate('/login'); // Redirect to login if user is not authenticated
      return;
    }

    const fetchData = async () => {
      setLoadingProgram(true);
      setLoadingProgress(true);

      try {
        // Fetch program details
        const programResponse = await fetch(`https://reahabbackend1.onrender.com/api/programs/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (!programResponse.ok) {
          throw new Error(`Failed to fetch program details: ${programResponse.statusText}`);
        }
        const programData = await programResponse.json();
        setProgram(programData);

        // Fetch progress details
        const progressResponse = await fetch(`https://reahabbackend1.onrender.com/api/progress/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (progressResponse.status === 404) {
          // No progress found, initialize the program
          const initResponse = await fetch(`https://reahabbackend1.onrender.com/api/progress/start`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ programId: id }),
          });

          if (!initResponse.ok) {
            const initData = await initResponse.json();
            if (initData.message.includes('Progress already started')) {
              // Progress already started for this program
              console.log('Progress already started, fetching progress data...');
              // Re-fetch progress data
              const newProgressResponse = await fetch(`https://reahabbackend1.onrender.com/api/progress/${id}`, {
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                },
              });
              if (!newProgressResponse.ok) {
                throw new Error(`Failed to fetch progress after initialization: ${newProgressResponse.statusText}`);
              }
              const newProgressData = await newProgressResponse.json();
              setProgress(newProgressData.exercisesCompleted || []);
            } else {
              throw new Error(`Failed to initialize program: ${initData.message || initResponse.statusText}`);
            }
          } else {
            // Program initialized successfully
            console.log('Program initialized successfully');
            // Re-fetch progress data after initialization
            const newProgressResponse = await fetch(`https://reahabbackend1.onrender.com/api/progress/${id}`, {
              headers: {
                'Authorization': `Bearer ${user.token}`,
              },
            });
            if (!newProgressResponse.ok) {
              throw new Error(`Failed to fetch progress after initialization: ${newProgressResponse.statusText}`);
            }
            const newProgressData = await newProgressResponse.json();
            setProgress(newProgressData.exercisesCompleted || []);
          }
        } else if (progressResponse.ok) {
          // Progress exists
          const progressData = await progressResponse.json();
          setProgress(progressData.exercisesCompleted || []);
        } else {
          throw new Error(`Failed to fetch progress: ${progressResponse.statusText}`);
        }
      } catch (error) {
        console.error('Error loading program or progress:', error);
        setError(`Error loading data: ${error.message}`);
      } finally {
        setLoadingProgram(false);
        setLoadingProgress(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!program || !program.exercises || program.exercises.length === 0) return 0;
    return (progress.length / program.exercises.length) * 100;
  };

  if (loadingProgram) return <p>Loading program details...</p>;
  if (loadingProgress) return <p>Loading progress...</p>;
  if (error) return <p>{error}</p>;
  if (!program) return <p>Program details not available.</p>;

  return (
    <div className="exercise-details-page">
      <h2>{program?.name}</h2>
      <p>{program?.description}</p>

      {program.exercises.length > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${calculateProgress()}%` }}>
            {calculateProgress().toFixed(2)}% Complete
          </div>
        </div>
      )}

      <div className="view-progress-history">
        <Link to={`/history/${id}`} className="btn btn-primary">
          View Progress History
        </Link>
      </div>

      {program.exercises.length > 0 ? (
        <ExerciseList
          exercises={program?.exercises || []}
          programId={id}
          progress={progress}
          setProgress={setProgress}
        />
      ) : (
        <p>No exercises available for this program</p>
      )}
    </div>
  );
};

export default ExerciseDetailsPage;
