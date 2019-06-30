import React, {useState} from 'react';
import { postData } from './Backend';

export default ({url, attributeName, callback}) => {
    const [data, setData] = useState("");
    const submit = async (event) => {
        event.preventDefault();
        if (data.trim().length === 0) {
            return; // No data to actually send
        }
        const requestData = {};
        requestData[attributeName] = data.trim();
        await postData(url, requestData);
        setData("");
        callback();
    }
    return (
        <form onSubmit={submit}>
            <label>{attributeName}</label>
            <input value={data} onChange={({target: {value}}) => setData(value)} />
            <button>Add {attributeName}</button>
        </form>
    );
}