import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, Message, Segment } from 'semantic-ui-react';
import baseUrl from '../../utils/baseUrl';
import catchError from '../../utils/catchErrors';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetToken } = router.query;
  const [newPassword, setNewPassword] = useState({ field1: '', field2: '' });
  const [showPassword, setShowPassword] = useState({
    input1: false,
    input2: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);

  const { input1, input2 } = showPassword;
  const { field1, field2 } = newPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPassword((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (field1.trim().length < 6) {
      return setErrorMsg('Passwords must be atleast six characters');
    }
    if (field1 !== field2) {
      return setErrorMsg('Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/api/reset/${resetToken}`, {
        newPassword: field1,
      });
      if ((res.statusText = 'OK')) {
        setSuccess(true);
      } else {
        throw new Error(res.data);
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
      {success ? (
        <Message
          attached
          success
          size="large"
          header="Password reset successfull"
          icon="check"
          content="Login Again"
          style={{ cursor: 'pointer' }}
          onClick={() => router.push('/login')}
        />
      ) : (
        <Message
          attached
          icon="settings"
          header="Reset Password"
          color="teal"
        />
      )}
      {!success && (
        <Form
          loading={loading}
          error={errorMsg !== null}
          onSubmit={handleSubmit}
        >
          <Message error header="Opps!" content={errorMsg} />
          <Segment>
            <Form.Input
              fluid
              icon={{
                name: 'eye',
                circular: true,
                link: true,
                style: { cursor: 'pointer' },
                onClick: () => {
                  setShowPassword((p) => ({ ...p, input1: !p.input1 }));
                },
              }}
              name="field1"
              type={input1 ? 'text' : 'password'}
              placeholder="Enter new password"
              onChange={handleChange}
              value={field1}
              required
            />
            <Form.Input
              fluid
              icon={{
                name: 'eye',
                circular: true,
                link: true,
                style: { cursor: 'pointer' },
                onClick: () => {
                  setShowPassword((p) => ({ ...p, input2: !p.input2 }));
                },
              }}
              name="field2"
              type={input2 ? 'text' : 'password'}
              placeholder="Confirm Password"
              onChange={handleChange}
              value={field2}
              required
            />
            <Divider />
            <Button
              type="Submit"
              content="Reset Password"
              color="primary"
              icon="configure"
              disabled={loading || field1.trim() === '' || field2.trim() === ''}
            />
          </Segment>
        </Form>
      )}
    </>
  );
}
