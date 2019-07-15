const { buildSchema } = require('graphql');
const storageAdapter = require('./storage/neo4j');

exports.schema = buildSchema(`
  type Query {
    shows: [Show],
    show(name: String!): Show
  }

  type Show {
    name: String!,
    characters(name: String): [Character]
  }

  type Character {
    name: String!,
    sentence: String
  }
`);

const getSentence = (show, name) => async () => {
  const sentence = await storageAdapter
    .generateSentence(show, name)
    .catch(console.log);
  return sentence;
};

const buildCharacter = (show, name) => ({
  name,
  sentence: getSentence(show, name),
});

const getCharactersByShow = show => async ({ name: filterName }) =>
  storageAdapter
    .getCharacters(show)
    .then(({ characters }) => characters)
    .then(c => {
      console.log(c, filterName);
      return c;
    })
    .then(characters =>
      filterName
        ? characters.filter(character => character.name.startsWith(filterName))
        : characters
    )
    .then(c => {
      console.log(c, filterName);
      return c;
    })
    .then(characters =>
      characters.map(({ name }) => buildCharacter(show, name))
    )
    .catch(console.log);

const getAllShows = async name => {
  const shows = await storageAdapter.getShows();
  return shows.map(show => {
    const characters = getCharactersByShow(show.name, name);
    return {
      characters,
      ...show,
    };
  });
};

const getShow = async ({ name }) => {
  const shows = await getAllShows(name).catch(console.log);
  return shows.find(show => show.name.startsWith(name));
};

exports.resolver = {
  shows: getAllShows,
  show: getShow,
};
