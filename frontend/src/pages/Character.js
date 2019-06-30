import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { useBackendGet, postData } from '../components/Backend';
import SingleAttributeForm from '../components/SingleAttributeForm';

function Character(props) {
    const {show, character} = props.match.params;
    const [{sentence}, getNewSentence] = useBackendGet(`/show/${show}/${character}/sentence`, "", console.log);
    return (
        <div id="character-page">
            <h1>{character}</h1>
            <p>Starring in: {show}</p>
            <h2>Generate sentence</h2>
            <p>{sentence}</p>
            <button onClick={getNewSentence}>Get a new sentence</button>
            <h2>Add sentence</h2>
            <SingleAttributeForm url={`/show/${show}/${character}/sentence`} attributeName="text" />
            <Link to={`/show/${show}/characters`}>Back</Link>
        </div>
    )
}

export default Character;