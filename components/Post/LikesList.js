import React, { useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Popup, List, Image } from 'semantic-ui-react';
import axios from 'axios';
import baseUrl from '../../utils/baseUrl';
import catchError from '../../utils/catchErrors';
import { LikesPlaceHolder } from '../Layout/PlaceHolderGroup';
import router from 'next/router';

export default function LikesList({ postId, trigger }) {
  const [likesList, setLikesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getLikesList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/posts/like/${postId}`, {
        headers: { Authorization: Cookies.get('token') },
      });
      setLikesList(res.data);
    } catch (error) {
      alert(catchError(error));
    }
    setLoading(false);
  };

  return (
    <Popup
      on="click"
      onClose={() => setLikesList([])}
      onOpen={getLikesList}
      popperDependencies={[likesList]}
      trigger={trigger}
      wide
    >
      {loading ? (
        <LikesPlaceHolder />
      ) : (
        <>
          {likesList.length > 0 && (
            <div
              style={{
                overflow: 'auto',
                maxHeight: '15rem',
                maxWidth: '15rem',
                minWidth: '210px',
              }}
            >
              <List selection size="large">
                {likesList.map((like) => (
                  <List.Item key={like._id}>
                    <Image avatar src={like.user.profilePicUrl} />
                    <List.Content>
                      <List.Header
                        onClick={() => router.push(`/${like.user.username}`)}
                        as="a"
                        content={like.user.name}
                      />
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </div>
          )}
        </>
      )}
    </Popup>
  );
}
