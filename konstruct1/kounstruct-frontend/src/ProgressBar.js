import React, { useState } from 'react';
import ProgressBar from './ProgressBar';

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Project Setup</h1>
      <ProgressBar currentStep={currentStep} onNext={handleNext} onPrevious={handlePrevious} />
    </div>
  );
};

export default App;
