import React from 'react';
import { Link } from 'react-router-dom';
import { useBackendGet } from '../components/Backend';
import SingleAttributeForm from '../components/SingleAttributeForm'


function character(name, show, index) {
    return (
        <li key={index}><Link to={`/show/${show}/character/${name}`}>{name}</Link></li>
    );
}

function Characters(props) {
    const show = props.match.params.show;
    const [{characters}, refreshCharacters] = useBackendGet(`/show/${show}/characters`, {characters: []}, console.log);
    return (
        <div id="characters-page">
            <h1>{show} Characters</h1>
            <button onClick={refreshCharacters}>Refresh Characters</button>
            <ul>
                {characters.map((name, index) => character(name, show, index))}
            </ul>
            <h2>Add Character</h2>
            <SingleAttributeForm url={`/show/${show}/character`} attributeName="name" callback={() => refreshCharacters()} />
            <Link to={`/`}>Back</Link>
        </div>
    )
}

export default Characters;