import React, { useEffect, useState } from 'react';
import computersData from '../computers.json';

interface PingResult {
  ipAddress: string;
  status: 'success' | 'error' | 'pending';
}

interface RdpStatus {
  ipAddress: string;
  rdpStatus: 'success' | 'error' | 'pending';
}

interface WolStatus {
  ipAddress: string;
  wolState: WolState;
}

type WolState = 'idle' | 'waking' | 'woken' | 'wokenError';

const About = () => {
  const [pingResults, setPingResults] = useState<PingResult[]>([]);
  const [rdpStatuses, setRdpStatuses] = useState<RdpStatus[]>([]);
  const [wolStatuses, setWolStatuses] = useState<WolStatus[]>([]);

  useEffect(() => {
    const pingComputers = async () => {
      for (const computer of computersData) {
        try {
          const response = await fetch(`http://localhost:80/ping/${computer.ipAddress}`);
          const data = await response.json();
          if (data.status === 'success') {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'success' as const };
            setPingResults(prevResults => [...prevResults, updatedResult]);
            console.log(`success ${computer.ipAddress}`);
            checkRdpStatus(computer.ipAddress);
          } else {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
            setPingResults(prevResults => [...prevResults, updatedResult]);
            console.log(`error ${computer.ipAddress}`);
          }
        } catch (error) {
          const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
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
    const updatedStatus = { ipAddress, rdpStatus: data.status };
    setRdpStatuses(prevStatuses => [...prevStatuses, updatedStatus]);
  };

  const sendWoL = async (macAddress: string) => {
    const ipAddress = computersData.find(computer => computer.macAddress === macAddress)?.ipAddress;
    if (!ipAddress) {
      console.log(`Could not find IP address for MAC address: ${macAddress}`);
      return;
    }

    const existingWolStatus = wolStatuses.find(status => status.ipAddress === ipAddress);
    if (existingWolStatus && existingWolStatus.wolState !== 'idle') {
      console.log(`WoL already in progress for IP address: ${ipAddress}`);
      return;
    }

    const updatedWolStatus = { ipAddress, wolState: 'waking' as const };
    setWolStatuses(prevStatuses => [...prevStatuses, updatedWolStatus]);

    const response = await fetch(`http://localhost:80/wol/${macAddress}`);
    const data = await response.json();
    console.log(data);

    if (data.status === 'success') {
      console.log('Waking up...');
      await new Promise(resolve => setTimeout(resolve, 0.01 * 60 * 1000)); // Wait for 2 minutes

      // Check ping status again after waiting
      const pingResponse = await fetch(`http://localhost:80/ping/${ipAddress}`);
      const pingData = await pingResponse.json();
      if (pingData.status === 'success') {
        setWolStatuses(prevStatuses => {
          const updatedStatuses = prevStatuses.map(status => {
            if (status.ipAddress === ipAddress) {
              return { ...status, wolState: 'woken' as const };
            }
            return status;
          });
          return updatedStatuses;
        });
      } else {
        setWolStatuses(prevStatuses => {
          const updatedStatuses = prevStatuses.map(status => {
            if (status.ipAddress === ipAddress) {
              return { ...status, wolState: 'wokenError' as const };
            }
            return status;
          });
          return updatedStatuses;
        });
      }

      const finalStatuses = rdpStatuses.map(status => {
        if (status.ipAddress === ipAddress) {
          return { ...status, rdpStatus: 'success' as const };
        }
        return status;
      });
      setRdpStatuses(finalStatuses);
      console.log('Computer has been woken up.');
    }
  };

  return (
    <div className="container mx-auto px-4 flex justify-center items-center min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {computersData.map((computer, index) => {
          const pingResult = pingResults.find(result => result.ipAddress === computer.ipAddress);
          const rdpStatus = rdpStatuses.find(status => status.ipAddress === computer.ipAddress);
          const wolStatus = wolStatuses.find(status => status.ipAddress === computer.ipAddress);

          const status = pingResult ? pingResult.status : 'pending';
          const rdpState = rdpStatus ? rdpStatus.rdpStatus : 'pending';
          const wolState = wolStatus ? wolStatus.wolState : 'idle';

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
                  {rdpState === 'success' && (
                    <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                      Vzdialená plocha
                    </button>
                  )}
                  {rdpState === 'error' && (
                    <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                      Vzdialená plocha
                    </button>
                  )}
                </>
              ) : status === 'error' ? (
                <>
                  <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 mt-2 rounded">
                    Offline
                  </button>
                  {wolState === 'idle' && (
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 mt-2 rounded"
                      onClick={() => sendWoL(computer.macAddress)}
                    >
                      Zobudiť
                    </button>
                  )}
                  {wolState === 'waking' && <p className="text-yellow-500">Zobúdzam počítač....</p>}
                  {wolState === 'woken' && <p className="text-green-500">Počítač zobudený</p>}
                  {wolState === 'wokenError' && <p className="text-red-500">Chyba pri zobúdzaní počítača</p>}
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
