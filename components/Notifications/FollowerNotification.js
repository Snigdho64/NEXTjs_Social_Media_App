import React, { useState } from 'react';
import { Button, Feed, Divider } from 'semantic-ui-react';
import { followUser, unFollowUser } from '../../utils/profileActions';
import calculateTime from '../../utils/calculateTime';
export default function FollowerNotification({
  notification,
  userFollowStats,
  setUserFollowStats,
}) {
  const [disabled, setDisabled] = useState(false);
  const isFollowing = userFollowStats.following.some(
    (following) => following.user === notification.user._id
  );

  return (
    <>
      <Feed.Event>
        <Feed.Label image={notification.user.profilePicUrl} />
        <Feed.Content>
          <Feed.Summary>
            <>
              <Feed.User as="a" href={`/${notification.user.username}`}>
                {notification.user.username}
              </Feed.User>{' '}
              started following you.
              <Feed.Date>{calculateTime(notification.date)}</Feed.Date>
            </>
          </Feed.Summary>
          <div style={{ position: 'absolute', right: '5px' }}>
            <Button
              size="small"
              comapct
              icon={isFollowing ? 'check circle' : 'add user'}
              color={isFollowing ? 'instagram' : 'twitter'}
              disabled={disabled}
              onClick={async () => {
                setDisabled(true);
                isFollowing
                  ? await unFollowUser(
                      notification.user._id,
                      setUserFollowStats
                    )
                  : await followUser(notification.user._id, setUserFollowStats);
                setDisabled(false);
              }}
            />
          </div>
        </Feed.Content>
      </Feed.Event>
      <Divider />
    </>
  );
}
