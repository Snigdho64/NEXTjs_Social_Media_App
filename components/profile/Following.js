import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { List, Button, Image } from 'semantic-ui-react';
import baseUrl from '../../utils/baseUrl';
import { followUser, unFollowUser } from '../../utils/profileActions';
import { NoFollowData } from '../Layout/NoData';
import Spinner from '../Layout/Spinner';

export default function Following({
  user,
  loggedUserFollowStats,
  setLoggedUserFollowStats,
  profile,
}) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const getFollowing = async () => {
      setLoading(true);
      try {
        const { data, statusText } = await axios.get(
          `${baseUrl}/api/profile/following/${profile.user._id}`,
          {
            headers: { Authorization: Cookies.get('token') },
          }
        );
        if (statusText !== 'OK') throw new Error(data);
        setFollowing(data);
      } catch (e) {
        console.log(e.message);
        alert('Error loading following');
      }
      setLoading(false);
    };
    getFollowing();
  }, [profile]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : following.length > 0 ? (
        following.map((following) => {
          const isFollowing = loggedUserFollowStats.following.find(
            (f) => f.user === following.user._id
          );
          return (
            <List key={following.user._id} divided verticalAlign="middle">
              <List.Item>
                <List.Content floated="right">
                  {following.user._id !== user._id && (
                    <Button
                      color={isFollowing ? 'instagram' : 'twitter'}
                      icon={isFollowing ? 'check' : 'add user'}
                      content={isFollowing ? 'Following' : 'Follow'}
                      disabled={followLoading}
                      onClick={async () => {
                        setFollowLoading(true);
                        isFollowing
                          ? await unFollowUser(
                              following.user._id,
                              setLoggedUserFollowStats
                            )
                          : followUser(
                              following.user._id,
                              setLoggedUserFollowStats
                            );
                        setFollowLoading(false);
                      }}
                    />
                  )}
                </List.Content>
                <Image avatar src={following.user.profilePicUrl} />
                <List.Content as="a" href={`/${following.user.username}`}>
                  {following.user.username}
                </List.Content>
              </List.Item>
            </List>
          );
        })
      ) : (
        <NoFollowData
          profileName={profile.user.name}
          followingComponent={true}
        />
      )}
    </>
  );
}
