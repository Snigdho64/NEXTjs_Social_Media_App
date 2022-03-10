import axios from 'axios';
import cookie from 'js-cookie';
import Router from 'next/router';
import React, { useEffect, useState } from 'react';
import { Image, List, Search } from 'semantic-ui-react';
import baseUrl from '../../utils/baseUrl';

export default function SearchMenu() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  let cancelReq;

  const handleChange = async (e) => {
    const { value } = e.target;
    console.log(value);
    if (value.trim().length === 0) {
      setLoading(false);
      setText(value);
      return;
    }
    setLoading(true);
    setText(value);
    try {
      cancelReq && cancelReq();
      const CancelToken = axios.CancelToken;
      const token = cookie.get('token');

      const res = await axios.get(`${baseUrl}/api/search/${value}`, {
        headers: { Authorization: token },
        cancelToken: new CancelToken((canceler) => {
          cancelReq = canceler;
        }),
      });

      if (res.data.length === 0) {
        results.length > 0 && setResults([]);
        return setLoading(false);
      }
      setResults(res.data);
    } catch (e) {
      alert('Error Searching');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (text.trim() === 0 && loading) {
      setLoading(false);
    }
  }, [text]);

  const resultRenderer = ({ _id, profilePicUrl, name }) => {
    return (
      <List key={_id}>
        <List.Item>
          <Image src={profilePicUrl} alt="ProfilePic" avatar />
          <List.Content header={name} as="a" />
        </List.Item>
      </List>
    );
  };

  return (
    <Search
      onBlur={() => {
        results.length > 0 && setResults([]);
        loading && setLoading(false);
        setText('');
      }}
      loading={loading}
      value={text}
      resultRenderer={resultRenderer}
      results={results}
      onSearchChange={handleChange}
      minCharacters={1}
      onResultSelect={(e, data) => {
        Router.push(`/${data.result.username}`);
      }}
    />
  );
}
