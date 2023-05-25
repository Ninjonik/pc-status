import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Computers from './pages/computers';
import AddComputer from './pages/addComputer';
import Footer from './pages/footer';
import Clock from './components/Clock';

const App = () => {
  return (
    <div className="App background-img">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <div className="content">
      <header className="bg-gray-800 text-white py-4 px-16 flex justify-around items-center">
        <div className="text-left flex-1">PC Status</div>
        <div>{<Clock />}</div>
        <nav className="flex-1">
          <ul className="flex space-x-4 justify-end">
            <li>
              <a href="/" className="text-white">
                Domov
              </a>
            </li>
            <li>
              <a href="/computers" className="text-white">
                Počítače
              </a>
            </li>
            <li>
              <a href="/add" className="text-white">
                Pridať počítač
              </a>
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
