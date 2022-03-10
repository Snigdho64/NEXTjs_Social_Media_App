import axios from 'axios';
import Cookies from 'js-cookie';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react';
import { Container, Feed, Segment } from 'semantic-ui-react';
import CommentNotification from '../components/Notifications/CommentNotification';
import FollowerNotification from '../components/Notifications/FollowerNotification';
import LikeNotification from '../components/Notifications/LikeNotification';
import baseUrl from '../utils/baseUrl';
import { NoNotifications } from '../components/Layout/NoData';

export default function Notifications({
  notifications,
  errorLoading,
  user,
  userFollowStats: loggedUserFollowStats,
}) {
  const [userFollowStats, setUserFollowStats] = useState(loggedUserFollowStats);

  useEffect(() => {
    const notificationRead = async () => {
      try {
        await axios.post(
          `${baseUrl}/api/notifications`,
          {},
          {
            headers: {
              Authorization: Cookies.get('token'),
            },
          }
        );
      } catch (err) {
        console.log(err);
      }
    };
    notificationRead();
  }, []);

  return (
    <Container style={{ marginTop: '1.5rem' }}>
      {notifications.length > 0 ? (
        <Segment color="teal" raised>
          <div
            style={{
              maxHeight: '40rem',
              overFlow: 'auto',
              height: '40rem',
              position: 'relative',
              width: '100%',
            }}
          >
            <Feed size="small">
              {notifications.map((notification) => (
                <>
                  {notification.type === 'newLike' &&
                    notification.post !== null && (
                      <LikeNotification notification={notification} />
                    )}
                  {notification.type === 'newComment' &&
                    notification.post !== null && (
                      <CommentNotification notification={notification} />
                    )}
                  {notification.type === 'newFollower' && (
                    <FollowerNotification
                      notification={notification}
                      userFollowStats={userFollowStats}
                      setUserFollowStats={setUserFollowStats}
                    />
                  )}
                </>
              ))}
            </Feed>
          </div>
        </Segment>
      ) : (
        <>
          <NoNotifications />
        </>
      )}
    </Container>
  );
}

Notifications.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/notifications`, {
      headers: {
        Authorization: token,
      },
    });
    return res.status === 200
      ? { notifications: res.data }
      : { notifications: {} };
  } catch (error) {
    return { errorLoading: true };
  }
};
