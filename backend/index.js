const express = require('express');
const bodyParser = require('body-parser');
const sample = require('lodash.sample');
const cors = require('cors');
const { runCrypto } = require('./datastore');

const SENTENCE_MAX_WORDS = 100;

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 8252;

app.get('/show/:show/characters', async (req, res) => {
  const { show } = req.params;
  const response = await runCrypto(
    'MATCH (c: character)-[:character_in]->(show {name: $show}) RETURN c.name as name',
    { show }
  ).catch(console.log);
  res.json({
    characters: response,
  });
});

app.post('/show/:show/character', async (req, res) => {
  await runCrypto(
    'MERGE (s: show {name: $show}) MERGE (c: character {name: $name})-[:character_in]->(s)',
    {
      name: req.body.name,
      show: req.params.show,
    },
    false
  ).catch(err => {
    console.log(err);
    res.sendStatus(500);
  });
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
  await runCrypto(query, args, false).catch(err => {
    console.log(err);
    res.sendStatus(500);
  });
  res.sendStatus(201);
});

const generateSentence = async (word, characterId, depth = 1) => {
  const nextWordQuery = `MATCH (w:word {value: $word})
                         MATCH (w)-[:followed_by {character_id: $characterId}]->(next)
                         RETURN labels(next)[0] as type, next.value as value`;
  const nextWordResponse = await runCrypto(nextWordQuery, {
    word,
    characterId,
  });
  const { type, value: nextWord } = sample(nextWordResponse);
  if (type === 'end' || depth > SENTENCE_MAX_WORDS) {
    return word;
  }
  return `${word} ${await generateSentence(nextWord, characterId, depth + 1)}`;
};

app.get('/show/:show/:name/sentence', async (req, res) => {
  const { show, name } = req.params;
  const firstWordQuery = `MATCH (c:character {name: $name})-[:character_in]->(show {name: $show}) 
                          MATCH (c)-[:starts_with]->(w)
                          RETURN ID(c) as id, w.value as value`;
  const retVal = await runCrypto(firstWordQuery, {
    name,
    show,
  }).catch(err => {
    console.log(err);
    res.sendStatus(500);
  });
  const sampledValue = sample(retVal || []);
  let sentence = '';
  if (sampledValue) {
    const {
      id: { low: characterId },
      value: word,
    } = sampledValue;

    sentence = await generateSentence(word, characterId);
    console.log('sentence:', sentence);
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
