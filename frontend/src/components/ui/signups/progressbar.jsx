import React from 'react';
import '../../../styles/progressbar.css';

const ProgressBar = ({ currentStep }) => {
  return (
    <div className='progress-bar'>
      <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
        <div className='circle'>1</div>
        <div className='label'>Enter your email address and password</div>
      </div>
      <div className={`line ${currentStep >= 2 ? 'active' : ''}`}></div>
      <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
        <div className='circle'>2</div>
        <div className='label'>Provide your basic info</div>
      </div>
    </div>
  );
};

export default ProgressBar;
