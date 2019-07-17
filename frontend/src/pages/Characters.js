import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SingleAttributeForm from '../components/SingleAttributeForm'
import {getCharacters} from '../components/GraphQL';


function character(name, show, index) {
    return (
        <li key={index}><Link to={`/show/${show}/character/${name}`}>{name}</Link></li>
    );
}

function Characters(props) {
    const show = props.match.params.show;
    const [{characters}, setCharacters] = useState({characters: []});
    const refreshCharacters = () => {
        getCharacters(show).then(({data}) => {
            setCharacters(data.show);
        }).catch(console.log);
    }
    useEffect(refreshCharacters, []);
    return (
        <div id="characters-page">
            <h1>{show} Characters</h1>
            <button onClick={refreshCharacters}>Refresh Characters</button>
            <ul>
                {characters.map(({name}, index) => character(name, show, index))}
            </ul>
            <h2>Add Character</h2>
            <SingleAttributeForm url={`/show/${show}/character`} attributeName="name" callback={() => refreshCharacters()} />
            <Link to={`/`}>Back</Link>
        </div>
    )
}

export default Characters;