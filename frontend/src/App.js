import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import Home from './pages/Home';
import Characters from './pages/Characters';
import Character from './pages/Character';

const client = new ApolloClient({
  uri: 'http://localhost:8252/graphql',
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <main className="App">
          <Route path="/" exact component={Home} />
          <Route path="/show/:show/characters" exact component={Characters} />
          <Route path="/show/:show/character/:character" exact component={Character} />
        </main>
      </Router>
    </ApolloProvider>
  );
}

export default App;
