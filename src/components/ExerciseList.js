// // ExerciseList.jsx
// import React, { useState, useEffect, useRef } from 'react';

// const ExerciseList = ({ exercises, programId, progress, setProgress }) => {
//   const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const timerInterval = useRef(null);

//   const isExerciseCompleted = (exerciseId) => {
//     return progress.some((e) => e.exerciseId === exerciseId);
//   };

//   const handleStartExercise = (index) => {
//     const exercise = exercises[index];

//     if (isExerciseCompleted(exercise._id)) return;

//     setActiveExerciseIndex(index);
//     setTimeLeft(exercise.duration * 60); // Convert minutes to seconds

//     // Clear any existing timer
//     if (timerInterval.current) {
//       clearInterval(timerInterval.current);
//     }

//     // Start countdown
//     timerInterval.current = setInterval(() => {
//       setTimeLeft((prevTime) => {
//         if (prevTime <= 1) {
//           clearInterval(timerInterval.current);
//           completeExercise(exercise);
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);
//   };

//   const completeExercise = async (exercise) => {
//     try {
//       // Optimistically update progress locally
//       const updatedProgress = [
//         ...progress,
//         {
//           exerciseId: exercise._id,
//           exerciseName: exercise.name,
//           completedAt: new Date().toISOString(),
//         },
//       ];
//       setProgress(updatedProgress);

//       // Send update to backend
//       const response = await fetch(
//         `http://localhost:4000/api/progress/${programId}/complete-exercise`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             exerciseId: exercise._id,
//             exerciseName: exercise.name,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to update progress on server');
//       }

//       // Optionally, you can re-fetch progress from backend to ensure consistency
//       // const freshProgress = await response.json();
//       // setProgress(freshProgress.exercisesCompleted || []);
//     } catch (error) {
//       console.error('Error completing exercise:', error);
//       // Optionally revert optimistic update if error occurs
//     } finally {
//       setActiveExerciseIndex(null);
//       setTimeLeft(0);
//     }
//   };

//   const handleCancelTimer = () => {
//     if (timerInterval.current) {
//       clearInterval(timerInterval.current);
//     }
//     setActiveExerciseIndex(null);
//     setTimeLeft(0);
//   };

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
//   };

//   return (
//     <div className="exercise-list">
//       <h3>Exercises</h3>
//       {exercises.length > 0 ? (
//         <div className="exercise-cards">
//           {exercises.map((exercise, index) => (
//             <div key={exercise._id} className="exercise-card">
//               <img
//                 src={exercise.imageUrl}
//                 alt={exercise.name}
//                 className="exercise-card-image"
//               />
//               <div className="exercise-card-content">
//                 <h4>{exercise.name}</h4>
//                 <p>{exercise.description}</p>
//                 <p>
//                   <strong>Duration:</strong> {exercise.duration} minutes
//                 </p>
//                 <p>
//                   <strong>Repetitions:</strong> {exercise.repetitions}
//                 </p>

//                 {/* Start/Completed Button */}
//                 <button
//                   onClick={() => handleStartExercise(index)}
//                   disabled={
//                     isExerciseCompleted(exercise._id) ||
//                     activeExerciseIndex !== null
//                   }
//                   className={`exercise-button ${
//                     isExerciseCompleted(exercise._id)
//                       ? 'completed'
//                       : 'start'
//                   }`}
//                 >
//                   {isExerciseCompleted(exercise._id)
//                     ? 'Completed'
//                     : 'Start Exercise'}
//                 </button>

//                 {/* Timer Display */}
//                 {activeExerciseIndex === index && (
//                   <div className="timer">
//                     <p>Time Remaining: {formatTime(timeLeft)}</p>
//                     <button
//                       onClick={handleCancelTimer}
//                       className="cancel-button"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No exercises available</p>
//       )}
//     </div>
//   );
// };

// export default ExerciseList;
import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../hooks/useAuthContext'; // Custom hook to manage authentication
import './ExerciseList.css';

const ExerciseList = ({ exercises, programId, progress, setProgress }) => {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerInterval = useRef(null);
  const { user } = useAuthContext(); // Get user from context

  // Check if an exercise is completed
  const isExerciseCompleted = (exerciseId) => {
    return progress.some((e) => e.exerciseId === exerciseId);
  };

  // Handle starting an exercise
  const handleStartExercise = (index) => {
    const exercise = exercises[index];

    if (isExerciseCompleted(exercise._id)) return; // Prevent starting a completed exercise

    setActiveExerciseIndex(index);
    setTimeLeft(exercise.duration * 60); // Convert minutes to seconds

    // Clear any existing timer
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    // Start countdown
    timerInterval.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval.current);
          completeExercise(exercise);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Mark an exercise as complete and update progress
  const completeExercise = async (exercise) => {
    // Optimistically update progress locally
    const updatedProgress = [
      ...progress,
      {
        exerciseId: exercise._id,
        exerciseName: exercise.name,
        completedAt: new Date().toISOString(),
      },
    ];

    // Temporarily store the previous progress state
    const previousProgress = [...progress];

    setProgress(updatedProgress);

    try {
      // Send update to backend
      const response = await fetch(
        `https://reahabbackend1.onrender.com/api/progress/${programId}/complete-exercise`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`, // Use token from context
          },
          body: JSON.stringify({
            exerciseId: exercise._id,
            exerciseName: exercise.name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update progress on server');
      }
    } catch (error) {
      console.error('Error completing exercise:', error);

      // Revert the progress only if the error occurs due to the backend not responding
      setProgress(previousProgress); // Revert to the previous state only in case of backend failure
    } finally {
      setActiveExerciseIndex(null);
      setTimeLeft(0);
    }
  };

  // Cancel the timer and reset states
  const handleCancelTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    setActiveExerciseIndex(null);
    setTimeLeft(0);
  };

  // Format time in MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return (
    <div className="custom-exercise-list">
      <h3 className="custom-exercise-title">Exercises</h3>
      {exercises.length > 0 ? (
        <div className="custom-exercise-cards">
          {exercises.map((exercise, index) => (
            <div key={exercise._id} className="custom-exercise-card">
              <img
                src={exercise.imageUrl}
                alt={exercise.name}
                className="custom-exercise-image"
              />
              <div className="custom-exercise-content">
                <h4 className="custom-exercise-name">{exercise.name}</h4>
                <p className="custom-exercise-description">{exercise.description}</p>
                <p>
                  <strong>Duration:</strong> {exercise.duration} minutes
                </p>
                <p>
                  <strong>Repetitions:</strong> {exercise.repetitions}
                </p>

                {/* Start/Completed Button */}
                <button
                  onClick={() => handleStartExercise(index)}
                  disabled={
                    isExerciseCompleted(exercise._id) || activeExerciseIndex !== null
                  }
                  className={`custom-exercise-button ${
                    isExerciseCompleted(exercise._id)
                      ? 'completed'
                      : 'start'
                  }`}
                >
                  {isExerciseCompleted(exercise._id)
                    ? 'Completed'
                    : 'Start Exercise'}
                </button>

                {/* Timer Display */}
                {activeExerciseIndex === index && (
                  <div className="custom-timer">
                    <p>Time Remaining: {formatTime(timeLeft)}</p>
                    <button
                      onClick={handleCancelTimer}
                      className="custom-cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="custom-no-exercises">No exercises available</p>
      )}
    </div>
  );
};

export default ExerciseList;
