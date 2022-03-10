import React from 'react';
import { List, Icon, ListContent } from 'semantic-ui-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logoutUser } from '../../utils/authUser';

export default function SideMenu({
  user: { unreadNotification, unreadMessage, username, email },
  pc = true,
}) {
  const router = useRouter();
  const isActive = (route) => router.pathname === route;
  return (
    <>
      <List
        style={{ paddingTop: '1rem' }}
        size="big"
        verticalAlign="middle"
        selection
      >
        <Link href="/">
          <List.Item active={isActive('/')}>
            <Icon name="home" size="large" color={isActive('/') && 'teal'} />
            {pc && (
              <List.Content>
                <List.Header content="Home" />
              </List.Content>
            )}
          </List.Item>
        </Link>
        <br />
        <Link href="/messages">
          <List.Item active={isActive('/messages')}>
            <Icon
              name={unreadMessage ? 'hand point right' : 'mail outline'}
              size="large"
              color={
                (isActive('/messages') && 'teal') || (unreadMessage && 'orange')
              }
            />
            {pc && (
              <List.Content>
                <List.Header content="Messages" />
              </List.Content>
            )}
          </List.Item>
        </Link>
        <br />
        <Link href="/notifications">
          <List.Item active={isActive('/notifications')}>
            <Icon
              name={unreadNotification ? 'hand point right' : 'bell outline'}
              size="large"
              color={
                (isActive('/notifications') && 'teal') ||
                (unreadNotification && 'orange')
              }
            />
            {pc && (
              <List.Content>
                <List.Header content="Notifications" />
              </List.Content>
            )}
          </List.Item>
        </Link>
        <br />
        <Link href={`/${username}`}>
          <List.Item active={router.query.username === username}>
            <Icon
              name="user"
              size="large"
              color={router.query.username === username && 'teal'}
            />
            {pc && (
              <List.Content>
                <List.Header content="Account" />
              </List.Content>
            )}
          </List.Item>
        </Link>
        <br />
        <List onClick={logoutUser.bind(this, email)}>
          <Icon name="log out" size="large" />
          {pc && (
            <List.Content>
              <List.Header content="Logout" />
            </List.Content>
          )}
        </List>
      </List>
    </>
  );
}
