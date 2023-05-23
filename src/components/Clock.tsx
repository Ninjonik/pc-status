import { FC, useEffect, useState } from 'react';

const Clock: FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Update the current time every second
    const intervalId = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setCurrentTime(timeString);
    }, 1000);

    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <h1>{currentTime}</h1>;
};

export default Clock;
