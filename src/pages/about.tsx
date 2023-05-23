import React, { useEffect, useState } from 'react';
import computersData from '../computers.json';

interface PingResult {
  ipAddress: string;
  status: 'success' | 'error' | 'pending';
}

const About = () => {
  const [pingResults, setPingResults] = useState<PingResult[]>([]);

  useEffect(() => {
    const pingComputers = async () => {
      const results: PingResult[] = [];
      for (const computer of computersData) {
        try {
          const response = await fetch(`http://localhost:80/ping/${computer.ipAddress}/80`);
          const data = await response.json();
          if (data.status === 'success') {
            results.push({ ipAddress: computer.ipAddress, status: 'success' });
            console.log(`success ${computer.ipAddress}`);
          } else {
            results.push({ ipAddress: computer.ipAddress, status: 'error' });
            console.log(`error ${computer.ipAddress}`);
          }
        } catch (error) {
          results.push({ ipAddress: computer.ipAddress, status: 'error' });
          console.log(`error ${computer.ipAddress}`);
        }
      }
      setPingResults(results);
    };
    

    pingComputers();
  }, []);

  return (
    <div className="container mx-auto px-4 flex justify-center items-center min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {computersData.map((computer, index) => {
          const pingResult = pingResults.find((result) => result.ipAddress === computer.ipAddress);
          const status = pingResult ? pingResult.status : 'pending';

          return (
            <div key={index} className="bg-gray-200 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{computer.name}</h3>
              <p className="mt-2">MAC Address: {computer.macAddress}</p>
              <p>IP Address: {computer.ipAddress}</p>
              {status === 'success' ? (
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                  Success
                </button>
              ) : status === 'error' ? (
                <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                  Error
                </button>
              ) : (
                <button className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                  Pending
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default About;
