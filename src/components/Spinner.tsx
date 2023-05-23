import React, { useState, useEffect } from 'react';

const Spinner = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const simulateLoading = () => {
      setLoading(true);

      // Simulating a delay of 3 seconds
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    simulateLoading(); // Replace this with your actual loading logic

  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647zM20 12c0-3.314-2.019-6.153-4.899-7.355l-3 2.647A7.962 7.962 0 0116 12h4zm-2 5.291l3 2.647A9.958 9.958 0 0024 12h-4a5.978 5.978 0 01-2 3.938z"></path>
        </svg>
      </div>
    );
  }

  return null; // Do not render anything if not loading
};

export default Spinner;
