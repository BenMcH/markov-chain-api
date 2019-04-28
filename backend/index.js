const neo4j = require('neo4j-driver').v1;
const express = require('express');
const bodyParser = require('body-parser');

const driver = neo4j.driver(
  'bolt://localhost:7687/',
  neo4j.auth.basic('neo4j', 'password')
);
const session = driver.session();

const app = express();
app.use(bodyParser.json());
const port = 8252;

app.get('/show/:show/characters', (req, res) => {
  const { show } = req.params;
  session
    .run(
      'MATCH (c: character)-[:character_in]->(show {name: $show}) RETURN c',
      { show }
    )
    .then(response =>
      res.json({ records: response.records.map(record => record._fields[0]) })
    )
    .catch(err => console.log(err));
});

app.post('/show/:show/character', (req, res) => {
  session
    .run(
      'MERGE (s: show {name: $show}) MERGE (c: character {name: $name})-[:character_in]->(s)',
      {
        name: req.body.name,
        show: req.params.show,
      }
    )
    .catch(err => console.log(err));
  res.sendStatus(200);
});

const createWordNode = wordId => `(${wordId}:word {value: $${wordId}})`;

const buildSecond = (word, secondId) => {
  if (typeof word !== 'undefined') {
    return `MERGE ${createWordNode(secondId)}`;
  }
  return `MERGE (${secondId}:end)`;
};

app.post('/show/:show/:name/sentence', (req, res) => {
  const { show, name } = req.params;
  const { text } = req.body;
  const words = text.split(' ');
  words.push(undefined); // capture the end of the sentence by "null terminating" the sentence
  const zippedWords = words.map((word, idx) => [
    idx > 0 ? words[idx - 1] : undefined,
    word,
  ]);
  let query =
    'MATCH (c:character {name: $name})-[:character_in]->(show {name: $show})';
  const args = { show, name };
  zippedWords.forEach((wordPair, index) => {
    const [firstWord, secondWord] = wordPair;
    const firstId = `1${index}`;
    const secondId = `2${index}`;
    args[firstId] = firstWord;
    args[secondId] = secondWord;
    const secondWordNode = buildSecond(secondWord, secondId);
    if (typeof firstWord !== 'undefined') {
      query = `${query} MERGE ${createWordNode(
        firstId
      )} ${secondWordNode} CREATE (${firstId})-[:followed_by {character_id: ID(c)}]->(${secondId})`;
    } else {
      query = `${query} ${secondWordNode} CREATE (c)-[:starts_with]->(${secondId})`;
    }
  });
  session
    .run(query, args)
    .then(response => res.json({ response }))
    .catch(err => console.log(err));
});

app.listen(port, () =>
  console.log(`Markov sentence generator listening on port ${port}!`)
);
