import React, { useState } from 'react';
import axios from 'axios';
import { serverAddress } from '../config';

interface Computer {
  name: string;
  macAddress: string;
  ipAddress: string;
}

const AddComputer: React.FC = () => {
  const [computerName, setComputerName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newComputer: Computer = {
      name: computerName,
      macAddress,
      ipAddress,
    };

    try {
      await axios.post(`${serverAddress}/add-computer`, newComputer);
      setSuccessMessage('Počítač úspešne pridaný!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(
        'Chyba pri pridávaní počítača, skúste to prosím znovu.'
      );
      setSuccessMessage('');
      console.log(error);
    }

    // Reset the form
    setComputerName('');
    setMacAddress('');
    setIpAddress('');
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
              className="input-field"
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
              className="input-field"
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
              className="input-field"
            />
          </div>
          <div className="flex justify-center">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
              Pridať
            </button>
          </div>
        </form>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
      </div>
    </div>
  );
};

export default AddComputer;
