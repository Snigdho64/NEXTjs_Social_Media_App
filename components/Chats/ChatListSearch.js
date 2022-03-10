import React, { useState } from 'react';
import { List, Image, Search } from 'semantic-ui-react';
import axios from 'axios';
import cookie from 'js-cookie';
import { useRouter } from 'next/router';
import baseUrl from '../../utils/baseUrl';

export default function ChatListSearch({ chats, setChats, setBannerData }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const router = useRouter();

  let cancel;
  const handleChange = async (e) => {
    const { value } = e.target;
    setText(value);
    setLoading(true);
    try {
      cancel && cancel();
      const CancelToken = axios.CancelToken;
      const token = cookie.get('token');

      const res = await axios.get(`${baseUrl}/api/search/${value}`, {
        headers: { Authorization: token },
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      if (res.data.length === 0) return setLoading(false);

      setResults(res.data);
    } catch (error) {
      console.log(error);
      alert('Error Searching');
    }
    setLoading(false);
  };

  const addChat = (result) => {
    const alreadyInChat = chats.some(
      (chat) => chat.messagesWith === result._id
    );
    if (alreadyInChat) return router.push(`/messages/?message=${result._id}`);
    else {
      const newChat = {
        messagesWith: result._id,
        name: result.name,
        profilePicUrl: result.profilePicUrl,
        lastMsg: '',
        date: Date.now(),
      };
      setBannerData({
        name: result.username,
        profilePicUrl: result.profilePicUrl,
      });
      setChats((prev) => [newChat, ...prev]);
      return router.push(`/messages/?message=${result._id}`);
    }
  };

  const ResultRenderer = ({ _id, profilePicUrl, name }) => {
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
      resultRenderer={ResultRenderer}
      results={results}
      onSearchChange={handleChange}
      minCharacters={1}
      onResultSelect={(e, data) => addChat(data.result)}
    />
  );
}
