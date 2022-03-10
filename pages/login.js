import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, Message, Segment } from 'semantic-ui-react';
import {
  FooterMessage,
  HeaderMessage,
} from '../components/Common/WelcomeMessage';
import { loginUser } from '../utils/authUser';

export default function login() {
  const [user, setUser] = useState({ email: '', password: '' });

  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = user;

  useEffect(() => {
    const isUser = Object.values({ email, password }).every((item) =>
      Boolean(item)
    );
    isUser ? setIsDisabled(false) : setIsDisabled(true);
  }, [user]);

  const inputChangeHandler = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await loginUser(user, setErrorMsg, setFormLoading);
    } catch (e) {
      setErrorMsg(e.message);
    }
    setFormLoading(false);
  };

  return (
    <>
      <HeaderMessage />
      <Form 
        loading={formLoading}
        error={errorMsg !== null}
        onSubmit={handleSubmit}
      >
        <Message
          error
          header="Opps!"
          content={errorMsg}
          onDismiss={() => setErrorMsg(null)}
        />
        <Segment>
          <Form.Input
            required
            label="Email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={inputChangeHandler}
            fluid
            icon="envelope"
            iconPosition="left"
            type="email"
          />
          <Form.Input
            required
            label="Password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={inputChangeHandler}
            fluid
            icon={{
              name: 'eye',
              circular: true,
              link: true,
              onClick: () => setShowPassword((s) => !s),
            }}
            iconPosition="left"
            type={showPassword ? 'text' : 'password'}
          />
          <Divider />
          <Button
            icon="sign in"
            content="login"
            type="submit"
            color="orange"
            disabled={isDisabled}
          />
        </Segment>
      </Form>
      <FooterMessage />
    </>
  );
}
