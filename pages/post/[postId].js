import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  Container,
  Divider,
  Icon,
  Image,
  Segment,
} from 'semantic-ui-react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { NoPostFound } from '../../components/Layout/NoData';
import CommentInputField from '../../components/Post/CommentInputField';
import LikesList from '../../components/Post/LikesList';
import PostComments from '../../components/Post/PostComments';
import baseUrl from '../../utils/baseUrl';
import calculateTime from '../../utils/calculateTime';
import { likePost } from '../../utils/postActions';

export default function PostPage({ post, errorLoading, user }) {
  const [likes, setLikes] = useState();

  const isLiked = post.likes.some((like) => like.user === user._id);

  const [comments, setComments] = useState(post.comment);

  if (errorLoading) return <NoPostFound />;

  return (
    <Container text>
      <Segment basic>
        <Card color="teal" fluid>
          {post.picUrl && (
            <Image
              src={post.picUrl}
              style={{ cursor: 'pointer' }}
              floated="left"
              wrapped
              ui={false}
              alt="PostImage"
              onClick={() => setShowModal(true)}
            />
          )}
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
                    {`${likes.length} ${likes.length === 1 ? 'like' : 'likes'}`}
                  </span>
                )
              }
            />
            <Icon
              name="comment outline"
              style={{ marginLeft: '7px' }}
              color="blue"
            />
            {comments.length > 0 &&
              comments.map(
                (comment, i) =>
                  i < 3 && (
                    <PostComments
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                      user={user}
                      setComments={setComments}
                    />
                  )
              )}
            <Divider hidden />
            <CommentInputField
              user={user}
              postId={post._id}
              setComments={setComments}
              setError={setError}
            />
          </Card.Content>
        </Card>
      </Segment>
      <Divider hidden />
    </Container>
  );
}

PostPage.getInitialProps = async (ctx) => {
  try {
    const { postId } = ctx.query;
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/posts/${postId}`, {
      headers: {
        Authorization: token,
      },
    });
    return { post: res.data };
  } catch (error) {
    console.log(err);
    return {
      errorLoading: true,
    };
  }
};
