import React from 'react';
import { Button } from './components/ui/button';
import './App.css';

function App() {
  return (
      <div className="App">
        <header className="App-header">
          <h1>Welcome to Smart Fridge</h1>
          <p>Your ultimate IoT-enabled refrigerator</p>
          <Button className="default" onClick={() => window.location.href = '/signup'}>Sign Up</Button>
        </header>
      </div>
  );
}

export default App;
