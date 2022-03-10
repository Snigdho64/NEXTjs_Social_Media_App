import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { postComment } from '../../utils/postActions';

export default function CommentInputField({
  postId,
  user,
  setComments,
  setError,
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const addComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postComment(postId, user, text, setComments, setText);
    } catch (e) {
      const error = catchError(e);
      setError(error);
    }
    setLoading(false);
  };

  return (
    <Form reply onSubmit={addComment}>
      <Form.Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add comment"
        action={{
          color: 'blue',
          icon: 'edit',
          loading: loading,
          disabled: text === '' || loading,
        }}
      />
    </Form>
  );
}
