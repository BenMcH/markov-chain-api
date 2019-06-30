import React, {useState} from 'react';
import { Link, withRouter } from 'react-router-dom';
import { useBackendGet } from '../components/Backend';

function Show({name: show}, index) {
    return (
        <li key={index}><Link to={`/show/${show}/characters`}>{show}</Link></li>
    );
}

function Form({history}) {
    const [name, setName] = useState("");
    const submit = (event) => {
        event.preventDefault();
        history.push(`/show/${name}/characters`);
    }
    return (
        <form onSubmit={(event) => submit(event, history)}>
            <input value={name} onChange={event => setName(event.target.value)} />
            <button>Go to Show</button>
        </form>
    )
}

function Home() {
    const [shows] = useBackendGet('/shows', [], console.log);
    const RedirectForm = withRouter(Form);
    return (
        <div id="home-page">
            <h1>Shows</h1>
            <ul>
                {shows.map(Show)}
            </ul>
            <h2>Show Not Listed? Enter your own!</h2>
            <RedirectForm />
        </div>
    )
}

export default Home;