import React from 'react';
import './ProgramCard.css';

const ProgramCard = ({ program, onSelect }) => {
  return (
    <div className="program-card" onClick={() => onSelect(program._id)}>
      <h3>{program.name}</h3>
      <p>{program.description}</p>
      <p><strong>Injury Type:</strong> {program.injuryType}</p>
    </div>
  );
};

export default ProgramCard;
