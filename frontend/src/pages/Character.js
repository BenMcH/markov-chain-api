import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SingleAttributeForm from '../components/SingleAttributeForm';
import { getSentence } from '../components/GraphQL'

function Character(props) {
    const {show, character} = props.match.params;
    const [sentence, setSentence] = useState("");
    const getNewSentence = () => {
        console.log("Here")
        getSentence(show, character).then(({data: {show: { characters: [{ sentence }] } }}) => {
            setSentence(sentence);
        })
    };
    return (
        <div id="character-page">
            <h1>{character}</h1>
            <p>Starring in: {show}</p>
            <h2>Generate sentence</h2>
            <p>{sentence}</p>
            <button onClick={() => getNewSentence()}>Get a new sentence</button>
            <h2>Add sentence</h2>
            <SingleAttributeForm url={`/show/${show}/${character}/sentence`} attributeName="text" />
            <Link to={`/show/${show}/characters`}>Back</Link>
        </div>
    )
}

export default Character;