import axios from 'axios';
import Cookies from 'js-cookie';
import baseUrl from './baseUrl';
import catchError from './catchErrors';

const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: {
    Authorization: Cookies.get('token'),
  },
});

export const submitNewPost = async (
  text,
  location,
  picUrl,
  setPosts,
  setNewPost,
  setError
) => {
  try {
    const res = await Axios.post('/', { text, location, picUrl });
    setPosts((prev) => [res.data, ...prev]);
    setNewPost({ text: '', location: '', picUrl: '' });
  } catch (error) {
    const errorMsg = catchError(error);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts, setShowToastr) => {
  try {
    await Axios.delete(`/${postId}`);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
    setShowToastr(true);
  } catch (error) {
    alert(catchError(error));
  }
};

export const likePost = async (postId, userId, setLikes, isLiked = false) => {
  try {
    if (!isLiked) {
      await Axios.post(`/like/${postId}`);
      setLikes((prev) => [...prev, { user: userId }]);
    } else {
      await Axios.put(`/unlike/${postId}`);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
    }
  } catch (error) {
    alert(catchError(error));
  }
};

export const postComment = async (postId, user, text, setComments, setText) => {
  try {
    const res = await Axios.post(`/comment/${postId}`, { text: text });
    const newComment = { _id: res, user, text, date: Date.now() };
    setComments((prev) => [newComment, ...prev]);
    setText('');
  } catch (error) {
    alert(catchError(error));
  }
};

export const deleteComment = async (postId, commentId, setComments) => {
  try {
    await Axios.delete(`/comment/${postId}/${commentId}`);
    setComments((prev) => prev.filter((comment) => comment._id !== commentId));
  } catch (error) {
    alert(catchError(error));
  }
};

