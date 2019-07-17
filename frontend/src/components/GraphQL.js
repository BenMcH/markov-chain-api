import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';

const client = new ApolloClient({
  uri: 'http://localhost:8252/graphql',
  defaultOptions: () => ({
    errorPolicy: 'all',
  })
});

export const getShows = async () => {
    return client.query({
        query: gql`
            query Shows {
                shows {
                    name
                }
            }
        `
    }).catch(err => console.log(err))
}

export const getCharacters = async (show) => {
    return client.query({
        query: gql`
            query Characters {
                show(name:"${show}") {
                    characters {
                        name
                    }
                }
            }
        `,
        fetchPolicy: 'network-only'
    }).catch(err => console.log(err))
}

export const getSentence = async (show, character) => {
    return client.query({
        query: gql`
            query Sentence {
                show(name:"${show}") {
                    characters(name:"${character}") {
                        sentence
                    }
                }
            }
        `,
        fetchPolicy: 'network-only'
    }).catch(err => console.log(err))
}