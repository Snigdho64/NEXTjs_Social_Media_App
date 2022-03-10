import React from 'react';
import {
  Modal,
  Grid,
  Image,
  Card,
  Icon,
  Divider,
  Message,
} from 'semantic-ui-react';
import calculateTime from '../../utils/calculateTime';
import PostComments from './PostComments';
import CommentInputField from './CommentInputField';
import { deletePost, likePost } from '../../utils/postActions';
import LikesList from './LikesList';
import Link from 'next/link';

export default function ImageModal({
  post,
  user,
  setLikes,
  likes,
  isLiked,
  comments,
  setComments,
  error,
  setError,
}) {
  return (
    <>
      {error && (
        <Message
          error
          onDismiss={() => setError(null)}
          content={error}
          header="Opps!"
        />
      )}
      <Grid columns={2} stackable relaxed>
        <Grid.Column>
          <Modal.Content image>
            <Image src={post.picUrl} size="large" wrapped />
          </Modal.Content>
        </Grid.Column>
        <Grid.Column>
          <Card fluid>
            <Card.Content>
              <Image
                floated="left"
                src={post.user.profilePicUrl}
                avatar
                circular
              />
              <Card.Header>
                <Link href={`/${post.user.username}`}>
                  <a>{post.user.username}</a>
                </Link>
              </Card.Header>
              <Card.Meta>{calculateTime(post.createdAt)}</Card.Meta>
              {post.location && <Card.Meta content={post.location} />}
              <Card.Description
                style={{
                  fontSize: '17px',
                  letterSpacing: '0.1px',
                  wordSpacing: '0.35px',
                }}
              >
                {post.text}
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Icon
                name={isLiked ? 'heart' : 'heart outline'}
                color="red"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  likePost(post._id, user._id, setLikes, isLiked);
                }}
              />
              <LikesList
                postId={post._id}
                trigger={
                  likes.length > 0 && (
                    <span className="spanLikesList">
                      {`${likes.length} ${
                        likes.length === 1 ? 'like' : 'likes'
                      }`}
                    </span>
                  )
                }
              />
              <Divider hidden />
              <div
                style={{
                  overflow: 'auto',
                  height: comments.length > 2 ? '200px' : '60px',
                  marginBottom: '8px',
                }}
              >
                {comments.length > 0 &&
                  comments.map((comment) => (
                    <PostComments
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                      user={user}
                      setComments={setComments}
                    />
                  ))}
              </div>
              <Divider hidden />
              <CommentInputField
                user={user}
                postId={post._id}
                setComments={setComments}
                setError={setError}
              />
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid>
    </>
  );
}
