import { useRouter } from 'next/router';
import React from 'react';
import { Comment, Icon, List } from 'semantic-ui-react';
import calculateTime from '../../utils/calculateTime';

export default function Chat({ chat, connectedUsers, deleteChat }) {
  const router = useRouter();
  const isOnline = connectedUsers.some(
    (user) => user.userId === chat.messagesWith
  );

  return (
    <>
      <List selection>
        <List.Item
          active={router.query.message === chat.messagesWith}
          onClick={() =>
            router.push(
              { pathname: '/messages', query: { message: chat.messagesWith } },
              undefined,
              {
                shallow: true,
              }
            )
          }
        >
          <Comment>
            <Comment.Avatar src={chat.profilePicUrl} />
            <Comment.Content>
              <Comment.Author as="a">
                {chat.name}
                {isOnline && <Icon name="circle" size="small" color="green" />}
              </Comment.Author>
              <Comment.Metadata>
                <div>{calculateTime(chat.date)}</div>
                <div style={{ position: 'absolute', right: '10px' }}>
                  <Icon
                    name="trash alternate"
                    color="red"
                    onClick={() => {
                      deleteChat(chat.messagesWith);
                    }}
                  />
                </div>
              </Comment.Metadata>
              {chat.lastMsg && (
                <Comment.Text>
                  {chat.lastMsg.length > 20
                    ? `${chat.lastMsg.subString(0, 20)}....`
                    : `${chat.lastMsg}`}
                </Comment.Text>
              )}
            </Comment.Content>
          </Comment>
        </List.Item>
      </List>
    </>
  );
}
