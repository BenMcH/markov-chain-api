import React from 'react';
import { Link } from 'react-router-dom';
import SingleAttributeForm from '../components/SingleAttributeForm';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const sentenceQuery = (show, character) => gql`
    query Sentence {
        show(name:"${show}") {
            characters(name:"${character}") {
                sentence
            }
        }
    }`;

const Sentence = ({show, character}) => {
    const query = sentenceQuery(show, character);
    return (
        <Query query={query}>
            {({ loading, error, data, refetch: getNewSentence }) => {
                if (loading) return <p>Loading...</p>;
                if (error) return <p>Error :(</p>;
        
                return data.show.characters.map(({ sentence }) => (
                <div key={sentence}>
                    <p>{sentence}</p>
                    <button onClick={() => getNewSentence()}>Get a new sentence</button>
                </div>
                ));
            }}
        </Query>
    )
    }

const Character = ({match: { params: { show, character }}}) => (
    <div id="character-page">
        <h1>{character}</h1>
        <p>Starring in: {show}</p>
        <h2>Generate sentence</h2>
        <Sentence show={show} character={character}/>
        <h2>Add sentence</h2>
        <SingleAttributeForm url={`/show/${show}/${character}/sentence`} attributeName="text" />
        <Link to={`/show/${show}/characters`}>Back</Link>
    </div>
)

export default Character;