import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { List, Button, Image } from 'semantic-ui-react';
import baseUrl from '../../utils/baseUrl';
import { followUser, unFollowUser } from '../../utils/profileActions';
import { NoFollowData } from '../Layout/NoData';
import Spinner from '../Layout/Spinner';

export default function Followers({
  user,
  loggedUserFollowStats,
  setLoggedUserFollowStats,
  profile,
}) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const getFollowers = async () => {
      setLoading(true);
      try {
        const { data, statusText } = await axios.get(
          `${baseUrl}/api/profile/followers/${profile.user._id}`,
          {
            headers: { Authorization: Cookies.get('token') },
          }
        );
        if (statusText !== 'OK') throw new Error('Error');
        setFollowers(data);
      } catch (e) {
        alert('Error loading followers');
      }
      setLoading(false);
    };
    getFollowers();
  }, [profile]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : followers.length > 0 ? (
        followers.map((follower) => {
          const isFollowing = loggedUserFollowStats.following.find(
            (f) => f.user === follower.user._id
          );
          return (
            <List key={follower.user._id} divided verticalAlign="middle">
              <List.Item>
                <List.Content floated="right">
                  {follower.user._id !== user._id && (
                    <Button
                      color={isFollowing ? 'instagram' : 'twitter'}
                      icon={isFollowing ? 'check' : 'add user'}
                      content={isFollowing ? 'Following' : 'Follow'}
                      disabled={followLoading}
                      onClick={async () => {
                        setFollowLoading(true);
                        isFollowing
                          ? await unFollowUser(
                              follower.user._id,
                              setLoggedUserFollowStats
                            )
                          : followUser(
                              follower.user._id,
                              setLoggedUserFollowStats
                            );
                        setFollowLoading(false);
                      }}
                    />
                  )}
                </List.Content>
                <Image avatar src={follower.user.profilePicUrl} />
                <List.Content as="a" href={`/${follower.user.username}`}>
                  {follower.user.username}
                </List.Content>
              </List.Item>
            </List>
          );
        })
      ) : (
        <NoFollowData
          profileName={profile.user.name}
          followersComponent={true}
        />
      )}
    </>
  );
}
