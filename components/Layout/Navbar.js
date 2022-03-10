import React from 'react';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { Container, Icon, Menu } from 'semantic-ui-react';

export default function Navbar() {
  const router = useRouter();
  const isActive = (route) => route === router.pathname;
  return (
    <Menu fluid borderless>
      <Container text>
        <Link href="/login">
          <Menu.Item header active={isActive('/login')}>
            <Icon size="large" name="sign in" />
            Login
          </Menu.Item>
        </Link>
        <Link href="/signup">
          <Menu.Item header active={isActive('/signup')}>
            <Icon size="large" name="signup" />
            Signup
          </Menu.Item>
        </Link>
      </Container>
    </Menu>
  );
}
