const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const storageAdapter = require('./storage/neo4j');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 8252;

app.get('/show/:show/characters', (req, res) => {
  const { show } = req.params;
  storageAdapter
    .getCharacters(show)
    .then(response => res.json(response))
    .catch(console.log);
});

app.post('/show/:show/character', async (req, res) => {
  const { name } = req.body;
  const { show } = req.params;
  storageAdapter
    .createCharacter(show, name)
    .then(() => res.sendStatus(201))
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
});

app.post('/show/:show/:name/sentence', (req, res) => {
  const { show, name } = req.params;
  const { text } = req.body;
  storageAdapter
    .insertSentence({ show, name, sentence: text })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    })
    .then(() => res.sendStatus(201));
});

app.get('/show/:show/:name/sentence', (req, res) => {
  const { show, name } = req.params;

  storageAdapter
    .generateSentence(show, name)
    .then(sentence => res.json({ sentence }))
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
});

app.get('/shows', (req, res) => {
  storageAdapter
    .getShows()
    .then(shows => res.json({ shows }))
    .catch(console.log);
});

app.listen(port, () =>
  console.log(`Markov sentence generator listening on port ${port}!`)
);
