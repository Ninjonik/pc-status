import React, { useEffect, useState } from 'react';
import computersData from '../computers.json';

/*
- Spraviť, aby vzdialená plocha sa checkovala rovnako, ako status, tiež success, error, pending
*/

interface PingResult {
  ipAddress: string;
  status: 'success' | 'error' | 'pending';
  rdpStatus: 'success' | 'error' | 'pending';
}

const About = () => {
  const [pingResults, setPingResults] = useState<PingResult[]>([]);

  useEffect(() => {
    const pingComputers = async () => {
      for (const computer of computersData) {
        try {
          const response = await fetch(`http://localhost:80/ping/${computer.ipAddress}`);
          const data = await response.json();
          if (data.status === 'success') {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'success' as const, rdpStatus: 'pending' as const };
            setPingResults(prevResults => [...prevResults, updatedResult]);
            console.log(`success ${computer.ipAddress}`);
          } else {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const, rdpStatus: 'pending' as const };
            setPingResults(prevResults => [...prevResults, updatedResult]);
            console.log(`error ${computer.ipAddress}`);
          }
        } catch (error) {
          const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const, rdpStatus: 'pending' as const };
          setPingResults(prevResults => [...prevResults, updatedResult]);
          console.log(`error ${computer.ipAddress}`);
        }
      }
    };

    pingComputers();
  }, []);

  const checkRdpStatus = async (ipAddress: string) => {
    const response = await fetch(`http://localhost:80/pingport/${ipAddress}/3389`);
    const data = await response.json();
    const updatedResults = pingResults.map((result) => {
      if (result.ipAddress === ipAddress) {
        return { ...result, rdpStatus: data.status };
      }
      return result;
    });
    setPingResults(updatedResults);
  };

  const sendWoL = async (macAddress: string) => {
    const response = await fetch(`http://localhost:80/wol/${macAddress}`);
    const data = await response.json();
    console.log(data);
  
    if (data.status === 'success') {
      const ipAddress = data.ipAddress;
      const updatedResults = pingResults.map(result => {
        if (result.ipAddress === ipAddress) {
          return { ...result, status: 'success' as const, rdpStatus: 'pending' as const };
        }
        return result;
      });
      setPingResults(updatedResults);
  
      console.log('Waking up...');
      await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000)); // Wait for 2 minutes
  
      const finalResults = pingResults.map(result => {
        if (result.ipAddress === ipAddress) {
          return { ...result, rdpStatus: 'success' as const };
        }
        return result;
      });
      setPingResults(finalResults);
      console.log('Computer has been woken up.');
    }
  };
  
  
  

  return (
    <div className="container mx-auto px-4 flex justify-center items-center min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {computersData.map((computer, index) => {
          const pingResult = pingResults.find(result => result.ipAddress === computer.ipAddress);
          const status = pingResult ? pingResult.status : 'pending';
          const rdpStatus = pingResult ? pingResult.rdpStatus : 'pending';

          return (
            <div key={index} className="bg-gray-200 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{computer.name}</h3>
              <p className="mt-2">MAC Adresa: {computer.macAddress}</p>
              <p>IP Adresa: {computer.ipAddress}</p>
              {status === 'success' ? (
                <>
                  <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                    Online
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 mt-2 ml-2 rounded"
                    onClick={() => checkRdpStatus(computer.ipAddress)}
                  >
                    Vzdialená plocha
                  </button>
                  {rdpStatus === 'success' && <p className="text-green-500">Dá sa pripojiť na vzdialenú plochu</p>}
                  {rdpStatus === 'error' && <p className="text-red-500">Na vzdialenú plochu sa pripojiť nedá</p>}
                </>
              ) : status === 'error' ? (
                <>
                  <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                    Offline
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 mt-2 rounded"
                    onClick={() => sendWoL(computer.macAddress)}
                  >
                    Zobudiť
                  </button>
                </>
              ) : (
                <button className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                  Pingovanie
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
