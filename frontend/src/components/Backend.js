import {useEffect, useState} from 'react';
import axios from 'axios';

const baseUrl = 'http://localhost:8252';

export const useBackendGet = (url, defaultValue, errCallback = console.log) => {
    const [data, setData] = useState(defaultValue);
    const refresh = () => {
        (async () => {
            const {data} = await axios.get(baseUrl + url).catch(errCallback);
            setData(data);
        })();
    }
    useEffect(refresh, [errCallback, url]);
    return [data, refresh];
}

export const postData = (url, data) => axios.post(baseUrl + url, data);