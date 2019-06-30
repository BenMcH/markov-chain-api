const neo4j = require('neo4j-driver').v1;
const express = require('express');
const bodyParser = require('body-parser');
const sample = require('lodash.sample');
const cors = require('cors');

const driver = neo4j.driver(
  'bolt://localhost:7687/',
  neo4j.auth.basic('neo4j', 'password')
);
const session = driver.session();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 8252;

app.get('/show/:show/characters', (req, res) => {
  const { show } = req.params;
  session
    .run(
      'MATCH (c: character)-[:character_in]->(show {name: $show}) RETURN c.name as name',
      { show }
    )
    .then(response =>
      res.json({
        characters: response.records.map(record => record._fields[0]),
      })
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

app.post('/show/:show/:name/sentence', async (req, res) => {
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
    const firstId = `a${index}`;
    const secondId = `b${index}`;
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

const keyValueToObject = (keys, values) =>
  keys.reduce((acc, key, idx) => ({ ...acc, [key]: values[idx] }), {});

const cryptoToJson = async ({ records }) =>
  records.map(record => keyValueToObject(record.keys, record._fields));

const runCrypto = async (query, params) => {
  const response = await session.run(query, params);
  const json = await cryptoToJson(response);
  return json;
};

app.get('/show/:show/:name/sentence', async (req, res) => {
  const { show, name } = req.params;
  const firstWordQuery = `MATCH (c:character {name: $name})-[:character_in]->(show {name: $show}) 
                          MATCH (c)-[:starts_with]->(w)
                          RETURN ID(c) as id, w.value as value`;
  const nextWordQuery = `MATCH (w:word {value: $word})
                         MATCH (w)-[:followed_by {character_id: $characterId}]->(next)
                         RETURN labels(next)[0] as type, next.value as value`;
  const retVal = await runCrypto(firstWordQuery, {
    name,
    show,
  }).catch(err => console.log(err));
  let {
    id: { low: characterId },
    value: word,
  } = sample(retVal);

  let sentence = word;
  for (let i = 0; i < 100; i += 1) {
    // Limit sentences to maximum of 100 words.
    const nextWordResponse = await runCrypto(nextWordQuery, {
      word,
      characterId,
    });
    const { type, value: nextWord } = sample(nextWordResponse);
    if (type === 'end') {
      break;
    }
    word = nextWord;
    sentence = `${sentence} ${word}`;
  }
  res.json({ sentence });
});

app.get('/shows', async (req, res) => {
  const query = 'MATCH(s:show) RETURN s.name as name';
  const shows = await runCrypto(query, {}).catch(console.log);
  res.json(shows);
});

app.listen(port, () =>
  console.log(`Markov sentence generator listening on port ${port}!`)
);
