import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form, FormInput, Message, Segment } from 'semantic-ui-react';
import baseUrl from '../../utils/baseUrl';
import catchError from '../../utils/catchErrors';

export default function ResetPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim().includes('@')) {
        return setErrorMsg('PLease Enter a valid email');
    }
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/api/reset`, { email });
      if ((res.statusText = 'OK')) {
        setEmailSent(true);
      }
    } catch (error) {
      setErrorMsg(catchError(error));
    }
    setLoading(false);
  };

  useEffect(() => {
    errorMsg !== null &&
      setTimeout(() => {
        setErrorMsg(null);
      }, 5000);
  }, [errorMsg]);

  return (
    <>
      {emailSent ? (
        <>
          <Message
            attached
            icon="mail"
            header="Check Your Inbox"
            content="Plea check your inbox for further instructions"
            success
          />
        </>
      ) : (
        <>
          <Message
            attached
            icon="settings"
            header="Reset Password"
            color="teal"
          />
        </>
      )}
      <Form loading={loading} onSubmit={handleSubmit} error={errorMsg !== null}>
        <Message error header="Opps" content={errorMsg} />
        <Segment>
          <Form.Input
            fluid
            icon="mail outline"
            placeholder="Enter email address"
            iconPosition="left"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
          <Button
            disabled={loading || errorMsg !== null || email.trim() === ''}
            type="submit"
            color="orange"
            content="Submit"
          />
        </Segment>
      </Form>
    </>
  );
}
