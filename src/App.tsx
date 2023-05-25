import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Computers from './pages/computers';
import AddComputer from './pages/addComputer';
import Footer from './pages/footer';

const App = () => {
  return (
    <div className="App background-img">
      <div className="content">
      <header className="bg-gray-800 text-white py-4 px-8 flex justify-between items-center">
          <div className="text-center">PC Status</div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="/" className="text-white">Domov</a>
              </li>
              <li>
                <a href="/computers" className="text-white">Počítače</a>
              </li>
              <li>
                <a href="/add" className="text-white">Pridať počítač</a>
              </li>
            </ul>
          </nav>
        </header>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/computers" element={<Computers />} />
            <Route path="/add" element={<AddComputer />} />
          </Routes>
        </BrowserRouter>
      </div>
      <Footer />
    </div>
  );
};

export default App;
