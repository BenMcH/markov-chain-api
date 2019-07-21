import React, { useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const Show = ({name: show}, index) => (
    <li key={index}><Link to={`/show/${show}/characters`}>{show}</Link></li>
);


const Form = ({history}) => {
    const [name, setName] = useState("");
    const submit = (event) => {
        event.preventDefault();
        if (name.trim().length > 0) {
            history.push(`/show/${name}/characters`);
        }
    }
    return (
        <form onSubmit={(event) => submit(event, history)}>
            <input value={name} onChange={event => setName(event.target.value)} />
            <button>Go to Show</button>
        </form>
    )
}

const showQuery = gql`
    query Shows {
        shows {
            name
        }
    }`;

const ShowProvider = ({children}) => (
    <Query query={showQuery}>
        {children}
    </Query>
)

const ShowsList = ({loading, error, data}) => {
    const RedirectForm = withRouter(Form);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>
    return (
        <div id="home-page">
            <h1>Shows</h1>
            <ul>
                {data.shows.map(Show)}
            </ul>
            <h2>Show Not Listed? Enter your own!</h2>
            <RedirectForm />
        </div>
    );
}

const Home = () => (
    <ShowProvider>{ShowsList}</ShowProvider>
)

export default Home;