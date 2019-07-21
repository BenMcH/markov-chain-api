import React from 'react';
import { Link } from 'react-router-dom';
import SingleAttributeForm from '../components/SingleAttributeForm'
import { Query } from 'react-apollo';
import gql from 'graphql-tag';


function character(name, show, index) {
    return (
        <li key={index}><Link to={`/show/${show}/character/${name}`}>{name}</Link></li>
    );
}

const characterQuery = (show) => gql`
    query Characters {
        show(name:"${show}") {
            name
            characters {
                name
            }
        }
    }`;

const CharacterProvider = (show) => ({children}) => (
    <Query query={characterQuery(show)}>
        {children}
    </Query>
)

const CharacterList = ({loading, error, data, refetch}) => {
    if (!loading && !error) {
        return (
            <div id="characters-page">
                <h1>{data.show.name} Characters</h1>
                <button onClick={refetch}>Refresh Characters</button>
                <ul>
                    {data.show.characters.map(({name}, index) => character(name, data.show.name, index))}
                </ul>
                <h2>Add Character</h2>
                <SingleAttributeForm url={`/show/${data.show.name}/character`} attributeName="name" callback={() => refetch()} />
                <Link to={`/`}>Back</Link>
            </div>
        )
    }
    if (error) return <p>Error :(</p>
    return <p>Loading</p>
}

function Characters(props) {
    const show = props.match.params.show;
    const Provider = CharacterProvider(show);
    return (
        <Provider>
            {CharacterList}
        </Provider>
    )
}

export default Characters;