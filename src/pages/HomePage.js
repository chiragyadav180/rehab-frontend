import React, { useEffect, useState } from 'react';
import ProgramCard from '../components/ProgramCard'; 
import './Homepage.css';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {
  const [programs, setPrograms] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();


  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('https://reahabbackend1.onrender.com/api/programs/');
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        const json = await response.json();
        setPrograms(json); 
        setLoading(false);
      } catch (error) {
        setError(error.message); 
        setLoading(false); 
      }
    };
    fetchPrograms();
  }, []);

  if (loading) return <p>Loading programs...</p>; 
  if (error) return <p>Error: {error}</p>; 

  const handleProgramSelect = (programId) => {
    // Navigate to the exercise details page
    navigate(`/program/${programId}`);
  };

  return (
    <div className='main'>
      <h1>Rehabilitation Programs</h1>
      <div className="program-list">
        {programs.map((program) => (
           <ProgramCard key={program._id} program={program} onSelect={() => handleProgramSelect(program._id)} />
        ))}
      </div>
      
    </div>
  );
};

export default HomePage;