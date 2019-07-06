import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Home from "./pages/Home";
import Characters from './pages/Characters';
import Character from './pages/Character';

function App() {
  return (
    <Router>
      <main className="App">
        <Route path="/" exact component={Home} />
        <Route path="/show/:show/characters" exact component={Characters} />
        <Route path="/show/:show/character/:character" exact component={Character} />
      </main>
    </Router>
  );
}

export default App;
