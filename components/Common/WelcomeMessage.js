import { useRouter } from 'next/router';
import React from 'react';
import Link from 'next/link';
import { Divider, Icon, Message } from 'semantic-ui-react';

export const HeaderMessage = () => {
  const router = useRouter();
  const signupRoute = router.pathname === '/signup';

  return (
    <Message
      color="teal"
      attatched="top"
      header={signupRoute ? 'Get Started' : 'Welcome Back'}
      icon={signupRoute ? 'settings' : 'privacy'}
      content={
        signupRoute ? 'Create New Account' : 'Login with Email and Password'
      }
    />
  );
};

export const FooterMessage = () => {
  const router = useRouter();
  const signupRoute = router.pathname === '/signup';

  return (
    <>
      {signupRoute ? (
        <>
          <Message attatched="bottom" warning>
            <Icon name="help" />
            Existing User? <Link href="/login">Login Here Instead</Link>
          </Message>
          <Divider hidden />
        </>
      ) : (
        <>
          <Message attatched="bottom" info>
            <Icon name="lock" />
            <Link href="/reset">Forgot Password?</Link>
          </Message>
          <Message attatched="bottom" warning>
            <Icon name="help" />
            New User? <Link href="/signup">Signup Here Instead</Link>
          </Message>
        </>
      )}
    </>
  );
};
