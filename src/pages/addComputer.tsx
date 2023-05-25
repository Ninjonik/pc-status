import React, { useState } from 'react';
import axios from 'axios';
import { serverAddress } from '../config';

const AddComputer = () => {
  const [computerName, setComputerName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateMacAddress = (address: string) => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(address);
  };
  
  const validateIpAddress = (address: string) => {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return ipRegex.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMacAddress(macAddress)) {
      setErrorMessage('Invalid MAC address format.');
      return;
    }

    if (!validateIpAddress(ipAddress)) {
      setErrorMessage('Invalid IP address format.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${serverAddress}/add-computer`, {
        name: computerName,
        macAddress,
        ipAddress,
      });

      if (response.data.success) {
        setSuccessMessage('Form submitted successfully!');
        setComputerName('');
        setMacAddress('');
        setIpAddress('');
        setErrorMessage('');
      } else {
        setErrorMessage(response.data.error);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('An error occurred while submitting the form.');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-4">Pridanie počítača</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="computerName" className="block font-medium">
              Meno počítača
            </label>
            <input
              id="computerName"
              type="text"
              placeholder="Meno počítača"
              value={computerName}
              onChange={(e) => setComputerName(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="macAddress" className="block font-medium">
              MAC Adresa
            </label>
            <input
              id="macAddress"
              type="text"
              placeholder="MAC Adresa"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="ipAddress" className="block font-medium">
              IP Adresa
            </label>
            <input
              id="ipAddress"
              type="text"
              placeholder="IP Adresa"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Pridať'}
            </button>
          </div>
        </form>
        {errorMessage && <p className="text-red-500 mt-4 text-center">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 mt-4 text-center">{successMessage}</p>}
      </div>
    </div>
  );
};

export default AddComputer;
