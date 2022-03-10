import React, { useEffect, useRef, useState } from 'react';
import { Comment, Divider, Grid, Header, Segment } from 'semantic-ui-react';
import io from 'socket.io-client';
import axios from 'axios';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import Chat from '../components/Chats/Chat';
import ChatListSearch from '../components/Chats/ChatListSearch';
import baseUrl from '../utils/baseUrl';
import MessageInputField from '../components/Messages/MessageInputField';
import Message from '../components/Messages/Message';
import { NoMessages } from '../components/Layout/NoData';
import Banner from '../components/Messages/Banner';
import getUserInfo from '../utils/getUserInfo';
import newMsgSound from '../utils/newMsgSound';

const scrollDivToBottom = (divRef) => {
  divRef.current !== null &&
    divRef.current.scrollIntoView({ behaviour: 'smooth' });
};

export default function Messages({ user, chatsData }) {
  const [chats, setChats] = useState(chatsData);
  const router = useRouter();
  const socket = useRef();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({ name: '', profilePicUrl: '' });
  const openChatId = useRef('');
  const divRef = useRef();

  // SET CONNECTION
  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit('join', { userId: user._id });
      socket.current.on('connectedUsers', ({ users }) => {
        setConnectedUsers(users);
      });
    }

    if (chats.length > 0 && !router.query.messsage) {
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      });
      const { name, profilePicUrl } = getUserInfo(router.query.message);
      setBannerData({ name, profilePicUrl });
      console.log(profilePicUrl);
    }

    return () => {
      if (socket.current) {
        socket.current.emit('close');
        socket.current.off();
      }
    };
  }, []);

  // LOAD MESSAGES
  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit('loadMessages', {
        userId: user._id,
        messagesWith: router.query.message,
      });

      socket.current.on('messagesLoaded', ({ chat }) => {
        setMessages(chat.messages);
        setBannerData({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl,
        });
        openChatId.current = chat.messagesWith._id;
        divRef.current && scrollDivToBottom(divRef);
      });
      socket.current.on('noChatFound', async () => {
        const { name, profilePicUrl } = await getUserInfo(
          router.query.messsage
        );
        setBannerData({ name, profilePicUrl });
        setMessages([]);
        openChatId.current = router.query.message;
      });
    };
    if (socket.current && router.query.message) loadMessages();
  }, [router.query.message]);

  //
  const sendMsg = (msg) => {
    if (socket.current) {
      socket.current.emit('sendNewMsg', {
        senderId: user._id,
        receiverId: openChatId.current,
        msg,
      });
    }
  };

  //MESSAGE SENT FROM SENDER
  useEffect(() => {
    if (socket.current) {
      socket.current.on('msgSent', ({ newMsg }) => {
        if (newMsg.receiver === openChatId.current) {
          setMessages((p) => [...p, newMsg]);
          setChats((p) => {
            const chats = [...p];
            const activeChatIdx = chats.findIndex(
              (c) => c.messagesWith === newMsg.receiver
            );
            const activeChat = chats.find(
              (c) => c.messagesWith === newMsg.receiver
            );
            activeChat.lastMsg = newMsg.msg;
            activeChat.date = newMsg.date;
            chats[activeChatIdx] = activeChat;
            return chats;
          });
        }
      });

      socket.current.on('newMsgReceived', async ({ newMsg }) => {
        let senderName;
        // WHEN SENDERS CHAT IS CURRENTLY OPENED
        if (newMsg.sender === openChatId.current) {
          setMessages((p) => [...p, newMsg]);
          setChats((p) => {
            const chats = [...p];
            const activeChatIdx = chats.findIndex(
              (c) => c.messagesWith === newMsg.sender
            );
            const activeChat = chats.find(
              (c) => c.messagesWith === newMsg.sender
            );
            senderName = activeChat.name;
            activeChat.lastMsg = newMsg.msg;
            activeChat.date = newMsg.date;
            chats[activeChatIdx] = activeChat;
            return chats;
          });
        } else {
          const hasPreviousChats = chats.some(
            (c) => c.messagesWith === newMsg.sender
          );
          if (hasPreviousChats) {
            setChats((p) => {
              const chats = [...p];
              const activeChatIdx = chats.findIndex(
                (c) => c.messagesWith === newMsg.sender
              );
              const activeChat = chats.find(
                (c) => c.messagesWith === newMsg.sender
              );
              senderName = activeChat.name;
              activeChat.lastMsg = newMsg.msg;
              activeChat.date = newMsg.date;
              chats[activeChatIdx] = activeChat;
              return chats;
            });
          } else {
            const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
            senderName = name;
            const newChat = {
              messagesWith: newMsg.sender,
              lastMsg: newMsg.msg,
              date: newMsg.date,
              name,
              profilePicUrl,
            };
            setChats((p) => [newChat, ...p]);
          }
        }
        await newMsgSound(senderName);
      });
    }
  }, []);

  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages]);

  const deleteMsg = (messageId) => {
    if (socket.current) {
      socket.current.emit('deleteMsg', {
        userId: user._id,
        messagesWith: openChatId.current,
        messageId,
      });
      socket.current.on('msgDeleted', () => {
        setMessages((p) => p.filter((msg) => msg._id !== messageId));
      });
    }
  };

  const deleteChat = (messagesWith) => {
    if (socket.current) {
      socket.current.emit('deleteChat', {
        userId: user._id,
        messagesWith,
      });
      socket.current.on('chatDeleted', () => {
        setChats((c) => c.filter((chat) => chat.messagesWith !== messagesWith));

        router.push('/messages', undefined, { shallow: true });
      });
    }
  };

  return (
    <>
      <Segment padded basic size="large" style={{ marginTop: '5px' }}>
        <Header
          icon="home"
          content="Go Back!"
          onClick={() => router.push('/')}
          style={{ cursor: 'pointer' }}
        />
        <Divider hidden />
        <div style={{ marginBottom: '10px' }}>
          <ChatListSearch
            chats={chats}
            setChats={setChats}
            setBannerData={setBannerData}
          />
        </div>
        {chats.length > 0 ? (
          <>
            <Grid stackable>
              <Grid.Column width={4}>
                <Comment.Group size="big">
                  <Segment
                    raised
                    style={{ overflow: 'auto', maxHeight: '32rem' }}
                  >
                    {chats.map((chat, i) => (
                      <Chat
                        key={i}
                        connectedUsers={connectedUsers}
                        chat={chat}
                        deleteChat={deleteChat}
                      />
                    ))}
                  </Segment>
                </Comment.Group>
              </Grid.Column>
              <Grid.Column width={12}>
                {router.query.message && (
                  <>
                    <div
                      style={{
                        overflow: 'auto',
                        overflowX: 'hidden',
                        height: '35rem',
                        maxHeight: '35rem',
                        backgroundColor: 'whitesmoke',
                      }}
                    >
                      <div style={{ position: 'sticky', top: '0' }}>
                        <Banner bannerData={bannerData} />
                      </div>
                      {messages.length > 0 &&
                        messages.map((message, i) => (
                          <Message
                            key={i}
                            divRef={divRef}
                            message={message}
                            user={user}
                            bannerProfilePic={bannerData.profilePicUrl}
                            deleteMsg={deleteMsg}
                          />
                        ))}
                    </div>
                    <MessageInputField sendMsg={sendMsg} />
                  </>
                )}
              </Grid.Column>
            </Grid>
          </>
        ) : (
          <>
            <NoMessages />
          </>
        )}
      </Segment>
    </>
  );
}

Messages.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token },
    });
    return { chatsData: res.data };
  } catch (e) {
    console.log(e);
    return { errorLoading: true };
  }
};
