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

    const pingSelectedComputer = async (ipAddress: string) => {
      if (ipAddress) {
        const computer = computersData.find((computer) => computer.ipAddress === ipAddress);
        if (computer) {
          if (devMode){
            computer.ipAddress = "127.0.0.1";
          }
          try {
            const response = await fetch(`${serverAddress}/ping/${computer.ipAddress}`);
            const data = await response.json();
            if (data.status === 'success') {
              const updatedResult = { ipAddress: computer.ipAddress, status: 'success' as const };
              setPingResults((prevResults) => [...prevResults, updatedResult]);
              console.log(`success ${computer.ipAddress}`);
              checkRdpStatus(computer.ipAddress);
              return "success";
            } else {
              const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
              setPingResults((prevResults) => [...prevResults, updatedResult]);
              console.log(`error ${computer.ipAddress}`);
              return "error";
            }
          } catch (error) {
            const updatedResult = { ipAddress: computer.ipAddress, status: 'error' as const };
            setPingResults((prevResults) => [...prevResults, updatedResult]);
            console.log(`error ${computer.ipAddress}`);
            return "error";
          }
        }
      }
    };
    

    const checkRdpStatus = async (ipAddress: string) => {
      const response = await fetch(`${serverAddress}/pingport/${ipAddress}/3389`);
      const data = await response.json();
      const updatedStatus = { ipAddress, rdpStatus: data.status };
      setRdpStatuses(prevStatuses => [...prevStatuses, updatedStatus]);
    };


    const sendWoL = async (macAddress: string) => {
      let ipAddress = computersData.find(computer => computer.macAddress === macAddress)?.ipAddress;
      if (!ipAddress) {
        console.log(`Nebola nájdená IP Adresa pre MAC Adresu: ${macAddress}`);
        return;
      }
    
      const existingWolStatus = wolStatuses.find(status => status.ipAddress === ipAddress);
      if (existingWolStatus && existingWolStatus.wolState !== 'idle' && existingWolStatus.wolState !== 'wokenError') {
        console.log(`WoL už prebieha pre IP Adresu: ${ipAddress}`);
        return;
      }
    
      const updatedWolStatus = { ipAddress, wolState: 'waking' as const };
      setWolStatuses(prevStatuses => [...prevStatuses.filter(status => status.ipAddress !== ipAddress), updatedWolStatus]);
    
      const response = await fetch(`${serverAddress}/wol/${macAddress}`);
      const data = await response.json();
      console.log(data);
    
      if (data.status === 'success') {
        console.log('Zobúdzanie...');
        let pingResponse;
        if (devMode){
          await new Promise(resolve => setTimeout(resolve, 0.01 * 60 * 1000));
          pingResponse = await fetch(`${serverAddress}/ping/127.0.0.1`);
        } else {
          await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
          pingResponse = await fetch(`${serverAddress}/ping/${ipAddress}`);
        }
        const pingData = await pingResponse.json();
        const computer = computersData.find((computer) => computer.ipAddress === ipAddress);
        if (pingData.status === 'success' && computer) {
          if (devMode){
            computer.ipAddress = "127.0.0.1";
            ipAddress = "127.0.0.1"; 
          }
          const updatedResult = { ipAddress: computer.ipAddress, status: 'success' as const };
          setPingResults((prevResults) => [...prevResults, updatedResult]);
          console.log(`success ${computer.ipAddress}`);
          checkRdpStatus(computer.ipAddress);
          setWolStatuses(prevStatuses => {
            const updatedStatuses = prevStatuses.map(status => {
              if (status.ipAddress === ipAddress) {
              // if (ipAddress === ipAddress) {
                console.log("woken");
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
                console.log("wokenError");
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
      }
    };

    const deleteComputer = async (macAddress: string) => {
      try {
        await axios.post(`${serverAddress}/remove-computer`, { macAddress });
      } catch (error) {
        console.log(error);  
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
          console.log(data);
        })
        .catch((error) => {
          // Handle any errors
          console.error(error);
        });
    
      setEditMode(false);
      setEditedValues(null);
    };
    
    

    return (
      <div>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-screen pt-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

                  {/* <p className="mt-2">MAC Adresa: {computer.macAddress}</p> */}
                  <p>IP Adresa: {computer.ipAddress}</p>
    
                  <div className="absolute top-0 right-0 mt-2 mr-2 space-x-2" data-testid="action_buttons">
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
                    <button
                      type="button"
                      rel="tooltip"
                      className="btn btn-danger btn-round"
                      name="remove"
                      onClick={() => deleteComputer(computer.macAddress)}
                    >
                      <i className="fa-sharp fa-solid fa-trash"></i>
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
                  </div>
    
                  <div className="grid grid-cols-2 gap-4 mt-4" data-testid="status_buttons">
                    {status === 'success' ? (
                      <>
                        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded" name="online">
                          Online
                        </button>
                        {rdpState === 'success' ? (
                          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded" name="rdp_success">
                            RDP
                          </button>
                        ) : rdpState === 'error' ? (
                          <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded" name="rdp_error">
                            RDP
                          </button>
                        ) : null}
                      </>
                    ) : status === 'error' ? (
                      <>
                        <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded" name="offline">
                          Offline
                        </button>
                        {wolState === 'idle' ? (
                          <button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
                            name="wake"
                            onClick={() => sendWoL(computer.macAddress)}
                          >
                            ⏰Zobudiť
                          </button>
                        ) : wolState === 'waking' ? (
                          <p className="text-yellow-500">Zobúdzam počítač....</p>
                        ) : wolState === 'woken' ? (
                          <p className="text-green-500">Počítač zobudený</p>
                        ) : wolState === 'wokenError' ? (
                          <div>
                            <button
                              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
                              name="wake"
                              onClick={() => sendWoL(computer.macAddress)}
                            >
                              ⏰Zobudiť
                            </button>
                            <p className="text-red-500">Počítač sa nepodarilo zobudiť</p>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <button className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded" name="pinging">
                        🏓Pingovanie
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
    
  };

  export default Computers;
