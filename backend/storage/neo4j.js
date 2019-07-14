const neo4j = require('neo4j-driver').v1;
const sample = require('lodash.sample');

const SENTENCE_MAX_WORDS = 100;

const driver = neo4j.driver(
  'bolt://localhost:7687/',
  neo4j.auth.basic('neo4j', 'password')
);
const session = driver.session();

const keyValueToObject = (keys, values) =>
  keys.reduce((acc, key, idx) => ({ ...acc, [key]: values[idx] }), {});

const cryptoToJson = async ({ records }) =>
  records.map(record => keyValueToObject(record.keys, record._fields));

const runCrypto = async (query, params, parseResponse = true) => {
  const response = await session.run(query, params);
  if (parseResponse) {
    const json = await cryptoToJson(response);
    return json;
  }
  return response;
};

exports.getCharacters = show =>
  runCrypto(
    'MATCH (c: character)-[:character_in]->(show {name: $show}) RETURN c.name as name',
    { show }
  )
    .then(characters => ({ characters }))
    .catch(console.log);

exports.createCharacter = (show, character) =>
  runCrypto(
    'MERGE (s: show {name: $show}) MERGE (c: character {name: $name})-[:character_in]->(s)',
    {
      name: character,
      show,
    },
    false
  );

const createWordNode = wordId => `(${wordId}:word {value: $${wordId}})`;

const buildSecond = (word, secondId) => {
  if (typeof word !== 'undefined') {
    return `MERGE ${createWordNode(secondId)}`;
  }
  return `MERGE (${secondId}:end)`;
};

const buildSentenceQuery = (args, zippedWords) => {
  let query =
    'MATCH (c:character {name: $name})-[:character_in]->(show {name: $show})';
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
  return query;
};

exports.insertSentence = ({ show, name, sentence }) => {
  const words = sentence.split(' ');
  words.push(undefined); // capture the end of the sentence by "null terminating" the sentence
  const zippedWords = words.map((word, idx) => [
    idx > 0 ? words[idx - 1] : undefined,
    word,
  ]);
  const args = { show, name };
  const query = buildSentenceQuery(args, zippedWords);
  return runCrypto(query, args, false);
};

const getNextWord = async (word, characterId, depth = 1) => {
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
  return `${word} ${await getNextWord(nextWord, characterId, depth + 1)}`;
};

const generateSentence = async (show, name) => {
  const firstWordQuery = `MATCH (c:character {name: $name})-[:character_in]->(show {name: $show}) 
                          MATCH (c)-[:starts_with]->(w)
                          RETURN ID(c) as id, w.value as value`;
  const retVal = await runCrypto(firstWordQuery, {
    name,
    show,
  });
  const sampledValue = sample(retVal || []);
  if (sampledValue) {
    const {
      id: { low: characterId },
      value: word,
    } = sampledValue;
    return getNextWord(word, characterId);
  }
};
exports.generateSentence = generateSentence;

exports.getShows = () => {
  const query = 'MATCH(s:show) RETURN s.name as name';
  return runCrypto(query, {});
};
