const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver(
  'bolt://localhost:7687/',
  neo4j.auth.basic('neo4j', 'password')
);
const session = driver.session();

const keyValueToObject = (keys, values) =>
  keys.reduce((acc, key, idx) => ({ ...acc, [key]: values[idx] }), {});

const cryptoToJson = async ({ records }) =>
  records.map(record => keyValueToObject(record.keys, record._fields));

exports.runCrypto = async (query, params, parseResponse = true) => {
  const response = await session.run(query, params);
  if (parseResponse) {
    const json = await cryptoToJson(response);
    return json;
  }
  return response;
};
