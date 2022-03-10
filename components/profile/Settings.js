import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Form,
  List,
  Message,
} from 'semantic-ui-react';
import { updateMessagePopup, updatePassword } from '../../utils/profileActions';

export default function Settings({ newMessagePopup }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showMessageSettings, setShowMessageSettings] = useState(false);
  const [messagePopup, setMessagePopup] = useState(newMessagePopup);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    success &&
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
  }, [success]);

  return (
    <>
      {success && (
        <>
          <Message success icon="check circle" header="Updated Successfully" />
          <Divider />
        </>
      )}
      <List size="huge" animated>
        <List.Item>
          <List.Icon name="user secret" size="large" verticalAlign="middle" />
          <List.Content>
            <List.Header
              onClick={() => setShowPasswordForm((p) => !p)}
              as="a"
              content="Update Password"
            />
          </List.Content>
          {showPasswordForm && (
            <UpdatePassword
              setSuccess={setSuccess}
              setShowPasswordForm={setShowPasswordForm}
            />
          )}
        </List.Item>
        <Divider />
        <List.Item>
          <List.Icon
            name="paper plane outline"
            size="large"
            verticalAlign="middle"
          />
          <List.Content>
            <List.Header
              onClick={() => setShowMessageSettings((p) => !p)}
              content="Show New Message Popup"
              as="a"
            />
          </List.Content>
          {showMessageSettings && (
            <div style={{ marginTop: '10px' }}>
              Control whether a Popup should appear when there is a New Message
              or not.
              <br />
              <br />
              <Checkbox
                checked={messagePopup}
                toggle
                onChange={() => {
                  updateMessagePopup(setMessagePopup, setSuccess);
                }}
              />
            </div>
          )}
        </List.Item>
        <Divider />
      </List>
    </>
  );
}

const UpdatePassword = ({ setSuccess, setShowPasswordForm }) => {
  const [loading, setLoading] = useState(false);
  const { errorMsg, setErroMsg } = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [showtyped, setShowTyped] = useState({ field1: false, field2: false });
  const { field1, field2 } = showtyped;
  const { currentPassword, newPassword } = passwords;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
  };

  useEffect(() => {
    errorMsg && setTimeout(() => setErroMsg(null), 5000);
  }, [errorMsg]);
  return (
    <>
      <Form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          await updatePassword(setSuccess, passwords);
          setLoading(false);
          setShowPasswordForm(false);
        }}
        errorMsg={errorMsg !== null}
        loading={loading}
      >
        <List.List>
          <List.Item>
            <Form.Input
              fluid
              icon={{
                name: 'eye',
                circular: true,
                link: true,
                onClick: () => setShowTyped((p) => ({ ...p, field1: !field1 })),
              }}
              type={field1 ? 'text' : 'password'}
              iconPosition="left"
              label="Current Password"
              name="currentPassword"
              onChange={handleChange}
              value={currentPassword}
            />
            <Form.Input
              fluid
              icon={{
                name: 'eye',
                circular: true,
                link: true,
                onClick: () => setShowTyped((p) => ({ ...p, field2: !field2 })),
              }}
              type={field2 ? 'text' : 'password'}
              iconPosition="left"
              label="New Password"
              name="newPassword"
              onChange={handleChange}
              value={newPassword}
            />
            <Button
              disabled={
                loading ||
                currentPassword.trim() === '' ||
                newPassword.trim() === ''
              }
              content="Confirm"
              compact
              type="submit"
              color="teal"
              icon="cofigure"
            />
            <Button
              disabled={loading}
              content="Cancel"
              compact
              type="button"
              icon="cofigure"
              onClick={() => setShowPasswordForm(false)}
            />
            <Message icon="meh" error header="Opps!" content={errorMsg} />
          </List.Item>
        </List.List>
      </Form>
      <Divider hidden />
    </>
  );
};
