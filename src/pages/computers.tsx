  import React, { useEffect, useState } from 'react';
  import computersData from '../computers.json';
  import { serverAddress, devMode } from '../config';
  import axios from 'axios';

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
    wolState: 'idle' | 'waking' | 'woken' | 'wokenError';
  }

  const Computers = () => {
    const [pingResults, setPingResults] = useState<PingResult[]>([]);
    const [rdpStatuses, setRdpStatuses] = useState<RdpStatus[]>([]);
    const [wolStatuses, setWolStatuses] = useState<WolStatus[]>([]);
    const [computers_Data, setComputers_Data] = useState<{ name: string; macAddress: string; ipAddress: string; }[]>([]);

    const updateComputers_Data = (updated_Data: { name: string; macAddress: string; ipAddress: string; }[]) => {
      setComputers_Data(updated_Data);
    };    

    useEffect(() => {
      const pingComputers = async () => {
        for (const computer of computersData) {
          try {
            const response = await fetch(`${serverAddress}/ping/${computer.ipAddress}`);
            const data = await response.json();
            if (data.status === 'success') {
              const updatedResult = { ipAddress: computer.ipAddress, status: 'success' as const };
              setPingResults(prevResults => [...prevResults, updatedResult]);
              //console.log(`success ${computer.ipAddress}`);
            } else {
              const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
              setPingResults(prevResults => [...prevResults, updatedResult]);
              //console.log(`error ${computer.ipAddress}`);
            }
          } catch (error) {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
            setPingResults(prevResults => [...prevResults, updatedResult]);
            console.log(`error ${computer.ipAddress}`);
          }
          await checkRdpStatus(computer.ipAddress);
        }
      };

      pingComputers();
    }, []);

    const pingSelectedComputer = async (ipAddress: string) => {
      if (ipAddress) {
        const computer = computersData.find((computer) => computer.ipAddress === ipAddress);
        if (computer) {
          const updatedResult = { ipAddress: computer.ipAddress, status: 'pending' as const };
          setPingResults((prevResults) => [...prevResults.filter(result => result.ipAddress !== ipAddress), updatedResult]);
          
          try {
            const response = await fetch(`${serverAddress}/ping/${computer.ipAddress}`);
            const data = await response.json();
            
            if (devMode) {
              data.status = getRandom('success', 'error');
              console.log('PING |   ', ipAddress, data.status)
            }
            
            if (data.status === 'success') {
              const updatedResult = { ipAddress: computer.ipAddress, status: 'success' as const };
              setPingResults((prevResults) => [...prevResults.filter(result => result.ipAddress !== ipAddress), updatedResult]);
              console.log(`PING | success ${computer.ipAddress}`);
              await checkRdpStatus(computer.ipAddress);
              return "success";
            } else {
              const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
              setPingResults((prevResults) => [...prevResults.filter(result => result.ipAddress !== ipAddress), updatedResult]);
              console.log(`PING | error ${computer.ipAddress}`);
              return "error";
            }
          } catch (error) {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
            setPingResults((prevResults) => [...prevResults.filter(result => result.ipAddress !== ipAddress), updatedResult]);
            console.log(`PING | error ${computer.ipAddress}`);
            return "error";
          }
        }
      }
    };

    const checkRdpStatus = async (ipAddress: string) => {
      try {
        const response = await fetch(`${serverAddress}/pingport/${ipAddress}/3389`);
        const data = await response.json();
        
        if (devMode) {
          data.status = getRandom('success', 'error');
        }
        
        const updatedStatus = { ipAddress, rdpStatus: data.status };
        
        setRdpStatuses(prevStatuses => {
          const index = prevStatuses.findIndex(status => status.ipAddress === ipAddress);
          
          if (index !== -1) {
            const newStatuses = [...prevStatuses];
            newStatuses[index] = updatedStatus;
            return newStatuses;
          } else {
            return [...prevStatuses, updatedStatus];
          }
        });
        
        console.log("RDP | ", data.status, ipAddress);
        
        return data.status;
      } catch (error) {
        console.log("Error:", error);
      }
    };
    

    function getRandom(...arr: any) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const sendWoL = async (macAddress: string) => {
      let ipAddress = computersData.find(computer => computer.macAddress === macAddress)?.ipAddress;
      if (!ipAddress) {
        console.log(`WOL | Nebola nájdená IP Adresa pre MAC Adresu: ${macAddress}`);
        return;
      }
    
      const existingWolStatus = wolStatuses.find(status => status.ipAddress === ipAddress);
      if (existingWolStatus && existingWolStatus.wolState !== 'idle' && existingWolStatus.wolState !== 'wokenError') {
        console.log(`WOL | WoL už prebieha pre IP Adresu: ${ipAddress}`);
        return;
      }
    
      const updatedWolStatus = { ipAddress, wolState: 'waking' as const };
      setWolStatuses(prevStatuses => [...prevStatuses.filter(status => status.ipAddress !== ipAddress), updatedWolStatus]);
    
      const response = await fetch(`${serverAddress}/wol/${macAddress}`);
      const data = await response.json();
      console.log('WOL | ', data);
    
      if (data.status === 'success') {
        console.log('WOL | Zobúdzanie...');
        let pingResponse;
        console.log("IP ADRESA", ipAddress);
        const rdpValue = await checkRdpStatus(ipAddress);
        if (rdpValue === "success") {
          setWolStatuses(prevStatuses => {
            const updatedStatuses = prevStatuses.map(status => {
              if (status.ipAddress === ipAddress) {
                console.log("WOL | woken");
                return { ...status, wolState: 'woken' as const };
              }
              return status;
            });
            return updatedStatuses.filter(status => status !== undefined);
          });
        } else {
          if (devMode){
            await new Promise(resolve => setTimeout(resolve, 0.01 * 60 * 1000));
            pingResponse = await fetch(`${serverAddress}/ping/127.0.0.1`);
          } else {
            await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
            pingResponse = await fetch(`${serverAddress}/ping/${ipAddress}`);
          }
          const pingData = await pingResponse.json();
          if (devMode){
            pingData.status = getRandom('error', 'success');
            console.log("WOL DEV RANDOM | ", pingData.status);
          }
          const computer = computersData.find((computer) => computer.ipAddress === ipAddress);
          if (pingData.status === 'success' && computer) {
            const updatedResult = { ipAddress: ipAddress, status: 'success' as const };
            setPingResults((prevResults) => [...prevResults, updatedResult]);
            console.log(`WOL | success ${computer.ipAddress}`);
            setWolStatuses(prevStatuses => {
              const updatedStatuses = prevStatuses.map(status => {
                if (status.ipAddress === ipAddress) {
                // if (ipAddress === ipAddress) {
                  console.log("WOL | woken");
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
                  console.log("WOL | wokenError");
                  return { ...status, wolState: 'wokenError' as const };
                }
                return status;
              });
              return updatedStatuses;
            });
          }
        }
        

      }
    };

    const deleteComputer = async (macAddress: string) => {
      try {
        await axios.post(`${serverAddress}/remove-computer`, { macAddress });
      } catch (error) {
        console.log('WOL | ', error);  
      }
    };

    const [editMode, setEditMode] = useState(false);
    const [editedValues, setEditedValues] = useState<{ ipAddress: string; name: string } | null>(null);

    const handleEditClick = (ipAddress: string, name: string) => {
      setEditMode(true);
      setEditedValues({ ipAddress, name });
    };
    
    const handleSaveClick = () => {
      // Update the computer data with the edited values
      const updatedComputers_Data = computersData.map((computer) => {
        if (computer.ipAddress === editedValues?.ipAddress) {
          return { ...computer, name: editedValues.name };
        }
        return computer;
      });
    
      // Update the computersData state variable
      setComputers_Data(updatedComputers_Data);
    
      // Send the updated data to the server
      fetch(`${serverAddress}/edit-computer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ipAddress: editedValues ? editedValues.ipAddress : '', name: editedValues ? editedValues.name : '' }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle the response if necessary
          console.log('WOL | ', data);
        })
        .catch((error) => {
          // Handle any errors
          console.error(error);
        });
    
      setEditMode(false);
      setEditedValues(null);
    };
    
    function getStatusColorClass(status: 'success' | 'error' | 'pending' | 'idle' | 'waking' | 'woken' | 'wokenError'): string {
      switch (status) {
        case 'success':
        case 'woken':
          return 'text-green-500';
        case 'error':
        case 'wokenError':
          return 'text-red-500';
        case 'pending':
        case 'waking':
          return 'text-yellow-500';
        default:
          return '';
      }
    }
    
    

    return (
      <div>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-screen pt-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
            {computersData.map((computer, index) => {
              const pingResult = pingResults.find((result) => result.ipAddress === computer.ipAddress);
              const rdpStatus = rdpStatuses.find((status) => status.ipAddress === computer.ipAddress);
              const wolStatus = wolStatuses.find((status) => status.ipAddress === computer.ipAddress);
    
              const status = pingResult ? pingResult.status : 'pending';
              const rdpState = rdpStatus ? rdpStatus.rdpStatus : 'pending';
              const wolState = wolStatus ? wolStatus.wolState : 'idle';
    
              return (
                <div key={index} className="bg-gray-200 p-4 rounded-lg shadow-md relative" data-testid="computer-item">
                  {editMode && editedValues?.ipAddress === computer.ipAddress ? (
                    <input
                      type="text"
                      value={editedValues.name}
                      name="name_input"
                      onChange={(e) => setEditedValues((prevValues) => ({ ...prevValues, name: e.target.value, ipAddress: prevValues?.ipAddress || '' }))}
                    />
                  ) : (
                    <h3 className="text-lg font-semibold" id="name">{computer.name}</h3>
                  )}

                  {/* <p className="mt-2"><i className="fas fa-desktop"></i> MAC Adresa: {computer.macAddress}</p> */}
                  <p><i className="fas fa-globe"></i> {computer.ipAddress}</p>

                  {/*
                  (devMode) ? (
                    <div>
                      <p className={getStatusColorClass(status)}>Status {status}</p>
                      <p className={getStatusColorClass(rdpState)}>RDP Status {rdpState}</p>
                      <p className={getStatusColorClass(wolState)}>WOL Status {wolState}</p>
                    </div>
                  ) : null
                  */}

                  {(status == 'pending') ? (
                    <div className="flex items-center" id="pinging">
                      <div className="relative inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent">
                        <span className="absolute top-1/2 left-full transform -translate-y-1/2 -translate-x-1/2 h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">
                          Pingovanie
                        </span>
                      </div>
                      <span className="ml-2">Pingovanie</span>
                    </div>
                  )
                  : (status === 'success' || rdpState === 'success' && wolState !== 'wokenError') || wolState === 'woken' ? (
                    <div className="flex justify-between">
                      <p className="text-green-600"><i className="fa-solid fa-plug"></i> Online</p>
                      {rdpState === 'success' ? (
                        <p className="text-green-600"><i className="fa-solid fa-circle-check"></i> RDP</p>
                      ) : (
                        <p className="text-red-600"><i className="fa-solid fa-circle-xmark"></i> RDP</p>
                      )}
                    </div>
                  ) : status === 'error' ? (
                    <div className='flex justify-between'>
                      <p className="text-red-600"><i className="fa-solid fa-power-off"></i> Offline</p>
                      <p className="text-red-600"><i className="fa-solid fa-circle-xmark"></i> RDP</p>
                    </div>
                  ) : null}

                  {wolState === 'waking' ? (
                    <div className="flex items-center" id="waking">
                      <div className="relative inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent">
                        <span className="absolute top-1/2 left-full transform -translate-y-1/2 -translate-x-1/2 h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">
                          Zobúdzanie
                        </span>
                      </div>
                      <span className="ml-2 text-yellow-500">Zobúdzanie</span>
                    </div>  
                  ) : wolState === 'woken' ? (
                    <p className="text-green-500">Zobudený</p>
                  ) : wolState === 'wokenError' ? (
                    <p className="text-red-500">Počítač sa nepodarilo zobudiť</p>
                  ) : null}
    
                  <div className="absolute top-0 right-0 mt-2 mr-2 space-x-2" data-testid="action_buttons">
                    {status === 'error' && (wolState === 'idle' || wolState === 'wokenError') ? (
                      <button
                      type="button"
                      rel="tooltip"
                      className="btn btn-danger btn-round"
                      name="wake"
                      onClick={() => sendWoL(computer.macAddress)}
                    >
                      <i className="fa-regular fa-bell"></i>
                    </button>
                    ) : null}
                    <button
                      type="button"
                      rel="tooltip"
                      className="btn btn-info btn-round"
                      name="refresh"
                      onClick={() => {
                        pingSelectedComputer(computer.ipAddress);
                      }}
                    >
                      <i className="fa-solid fa-arrows-rotate"></i>
                    </button>
                    {editMode && editedValues?.ipAddress === computer.ipAddress ? (
                      <button
                      type="button"
                      rel="tooltip"
                      className="btn btn-secondary btn-round"
                      name="save"
                      onClick={() => handleSaveClick()}
                    >
                      <i className="fa-sharp fa-solid fa-save"></i>
                    </button>

                    ) : (         
                    <button
                    type="button"
                    rel="tooltip"
                    className="btn btn-secondary btn-round"
                    name="edit"
                    onClick={() => handleEditClick(computer.ipAddress, computer.name)}
                    >
                    <i className="fa-sharp fa-solid fa-pencil"></i>
                    </button>
                    )}
                    <button
                      type="button"
                      rel="tooltip"
                      className="btn btn-danger btn-round"
                      name="remove"
                      onClick={() => deleteComputer(computer.macAddress)}
                    >
                      <i className="fa-sharp fa-solid fa-trash"></i>
                    </button>
                  </div>
                  { /*
                  <div className="grid grid-cols-2 gap-4 mt-4" data-testid="status_buttons">
                    {status === 'success' ? (
                      <>
                        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded" name="online" disabled>
                        <i className="fa-solid fa-plug"></i> Online
                        </button>
                        {rdpState === 'success' ? (
                          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded" name="rdp_success" disabled>
                            <i className="fa-regular fa-circle-check"></i> RDP
                          </button>
                        ) : rdpState === 'error' ? (
                          <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded" name="rdp_error" disabled>
                            <i className="fa-regular fa-circle-xmark"></i> RDP
                          </button>
                        ) : null}
                      </>
                    ) : status === 'error' ? (
                      <>
                        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded" name="offline" disabled>
                        <i className="fa-solid fa-power-off"></i> Offline
                        </button>
                        {wolState === 'waking' ? (
                          <div className="flex items-center" id="waking">
                            <div className="relative inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent">
                              <span className="absolute top-1/2 left-full transform -translate-y-1/2 -translate-x-1/2 h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">
                                Zobúdzanie
                              </span>
                            </div>
                            <span className="ml-2 text-yellow-500">Zobúdzanie</span>
                          </div>  
                        ) : wolState === 'woken' ? (
                          <p className="text-green-500">Zobudený</p>
                        ) : wolState === 'wokenError' ? (
                          <p className="text-red-500">Počítač sa nepodarilo zobudiť</p>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex items-center" id="pinging">
                        <div className="relative inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent">
                          <span className="absolute top-1/2 left-full transform -translate-y-1/2 -translate-x-1/2 h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">
                            Pingovanie
                          </span>
                        </div>
                        <span className="ml-2">Pingovanie</span>
                      </div>
                    )}
                  </div>
                    */}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
    
  };

  export default Computers;
