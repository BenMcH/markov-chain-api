import {useEffect, useState} from 'react';
import axios from 'axios';

const baseUrl = 'http://localhost:8252';

export const get = async url => axios.get(baseUrl + url);

export const useBackendGet = (url, defaultValue, errCallback = console.log) => {
    const [data, setData] = useState(defaultValue);
    const refresh = () => {
        (async () => {
            const {data} = await get(url).catch(errCallback);
            setData(data);
        })();
    }
    useEffect(refresh, [errCallback, url]);
    return [data, refresh];
}

export const postData = (url, data) => axios.post(baseUrl + url, data);