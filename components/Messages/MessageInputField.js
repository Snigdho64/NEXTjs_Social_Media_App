import React, { useState } from 'react';
import { Form, Segment } from 'semantic-ui-react';

export default function MessageInputField({ sendMsg }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ position: 'sticky', bottom: '0' }}>
      <Segment secondary color="teal" attached="bottom">
        <Form
          reply
          onSubmit={(e) => {
            e.preventDefault();
            sendMsg(text);
            // setLoading(false);
            setText('');
          }}
        >
          <Form.Input
            size="large"
            placeholder="Send new message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            action={{
              icon: 'telegram plane',
              color: 'blue',
              disabled: text === '',
              loading: loading,
            }}
          />
        </Form>
      </Segment>
    </div>
  );
}
