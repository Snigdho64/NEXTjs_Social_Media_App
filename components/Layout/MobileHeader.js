import React from 'react';
import { Container, Dropdown, Icon, Menu } from 'semantic-ui-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logoutUser } from '../../utils/authUser';

export default function MobileHeader({
  user: { unreadNotification, unreadMessage, username, email },
}) {
  const router = useRouter();
  const isActive = (route) => router.pathname === route;
  return (
    <>
      <Menu fluid borderless>
        <Container text>
          <Link href="/">
            <Menu.Item header active={isActive('/')}>
              <Icon name="rss" size="large" color={isActive('/') && 'teal'} />
            </Menu.Item>
          </Link>

          <Link href="/messages">
            <Menu.Item header active={isActive('/messages')}>
              <Icon
                name={unreadMessage ? 'hand point right' : 'mail outline'}
                size="large"
                color={
                  (isActive('/messages') && 'teal') ||
                  (unreadMessage && 'orange')
                }
              />
            </Menu.Item>
          </Link>

          <Link href="/notifications">
            <Menu.Item
              header
              active={isActive('/notifications') || unreadNotification}
            >
              <Icon
                name={unreadNotification ? 'hand point right' : 'bell outline'}
                size="large"
              />
            </Menu.Item>
          </Link>
          <Dropdown item icon="bars" direction="left">
            <Dropdown.Menu>
              <Link href={`/${username}`}>
                <Dropdown.Item active={router.query.username === username}>
                  <Icon
                    name="user"
                    size="large"
                    color={router.query.username === username && 'teal'}
                  />
                  Account
                </Dropdown.Item>
              </Link>
              <Link href="/search">
                <Dropdown.Item active={isActive('/search')}>
                  <Icon name="search" size="large" />
                  Search
                </Dropdown.Item>
              </Link>
              <Dropdown.Item onClick={() => logoutUser(email)}>
                <Icon name="sign out alternate" size="large" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Container>
      </Menu>
    </>
  );
}
