import React from 'react';
import { Button, Divider, Form, Message, TextArea } from 'semantic-ui-react';

export default function CommonInput({
  user: { bio, facebook, instagram, twitter, youtube },
  onChange,
  showSocialLinks,
  setShowSocialLinks,
}) {
  return (
    <>
      <Form.Field
        required
        control={TextArea}
        name="bio"
        value={bio}
        onChange={onChange}
        placeholder="Bio"
      />
      <Button
        content="Add Social Links"
        color="red"
        icon="at"
        type="button"
        onClick={() => {
          setShowSocialLinks(!showSocialLinks);
        }}
      />
      {showSocialLinks && (
        <>
          <Divider />
          <Form.Input
            icon="facebook f"
            iconPosition="left"
            name="facebook"
            value={facebook}
            onChange={onChange}
          />
          <Form.Input
            icon="twitter"
            iconPosition="left"
            name="twitter"
            value={twitter}
            onChange={onChange}
          />

          <Form.Input
            icon="instagram"
            iconPosition="left"
            name="instagram"
            value={instagram}
            onChange={onChange}
          />

          <Form.Input
            icon="youtube"
            iconPosition="left"
            name="youtube"
            value={youtube}
            onChange={onChange}
          />
          <Message
            icon="attention"
            info
            size="small"
            header="Social Media Links Are Optional"
          />
        </>
      )}
    </>
  );
}
