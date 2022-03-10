import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { parseCookies } from 'nookies';
import { NoPosts } from '../components/Layout/NoData';
import { Segment } from 'semantic-ui-react';
import baseUrl from '../utils/baseUrl';
import axios from 'axios';
import CreatePost from '../components/Post/CreatePost';
import CardPost from '../components/Post/CardPost';
import { PostDeleteToastr } from '../components/Layout/Toastr';
import cookies from 'js-cookie';
import InfiniteScroll from 'react-infinite-scroll-component';
import MessageNotificationModal from '../components/Home/MessageNotificationModal';
import NotificationPortal from '../components/Home/NotificationPortal';
import {
  EndMessage,
  PlaceHolderPosts,
} from '../components/Layout/PlaceHolderGroup';
import getUserInfo from '../utils/getUserInfo';
import newMsgSound from '../utils/newMsgSound';

function Index({ user, userFollowStats, postsData, errorLoading }) {
  // console.log(user, userFollowStats);
  const [posts, setPosts] = useState(postsData);
  const [showToastr, setShowToastr] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(2);

  const socket = useRef();

  const [receivedMessage, setReceivedMessage] = useState(null);
  const [showMsgModal, setShowMsgModal] = useState(false);

  const [newNotification, setNewNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }
    if (socket.current) {
      socket.current.emit('join', { userId: user._id });
      socket.current.on('newMsgReceived', async ({ newMsg }) => {
        const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
        if (user.newMessagePopup) {
          setReceivedMessage({ ...newMsg, name, profilePicUrl });
          setShowMsgModal(true);
        }
        newMsgSound(name);
      });
    }
    document.title = `Welcome ${user.username}`;
    return () => {
      if (socket.current) {
        socket.current.emit('close');
        socket.current.off();
      }
    };
  }, []);

  useEffect(() => {
    showToastr && setTimeout(() => setShowToastr(false), 3000);
  }, [showToastr]);

  const fetchDataOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/posts`, {
        headers: { Authorization: cookies.get('token') },
        params: { pageNumber },
      });
      console.log(res.data);
      if (res.data.length === 0) setHasMore(false);
      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (e) {
      alert('Error fetch posts');
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on(
        'newNotificationReceived',
        ({ name, username, profilePicUrl, postId }) => {
          setNewNotification({ name, profilePicUrl, username, postId });
          setShowNotification(true);
        }
      );
    }
  }, []);

  return (
    <>
      {showNotification && newNotification !== null && (
        <NotificationPortal
          newNotification={newNotification}
          showNotification={showNotification}
          setShowNotification={setShowNotification}
        />
      )}
      {showToastr && <PostDeleteToastr />}
      {showMsgModal && receivedMessage && (
        <MessageNotificationModal
          socket={socket}
          user={user}
          receivedMessage={receivedMessage}
          setShowMsgModal={setShowMsgModal}
          showMsgModal={showMsgModal}
        />
      )}

      <Segment>
        <CreatePost user={user} setPosts={setPosts} />
        {posts.length === 0 || errorLoading ? (
          <NoPosts />
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            next={fetchDataOnScroll}
            loader={<PlaceHolderPosts />}
            endMessage={<EndMessage />}
            dataLength={posts.length}
          >
            {posts.map((post) => (
              <CardPost
                key={post._id}
                post={post}
                user={user}
                setPosts={setPosts}
                setShowToastr={setShowToastr}
                socket={socket}
              />
            ))}
          </InfiniteScroll>
        )}
      </Segment>
    </>
  );
}
export default Index;

Index.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/posts`, {
      headers: {
        Authorization: token,
      },
      params: { pageNumber: 1 },
    });
    return { postsData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};
