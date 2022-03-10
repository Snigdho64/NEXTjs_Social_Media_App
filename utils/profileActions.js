import axios from 'axios';
import Cookies from 'js-cookie';
import Router from 'next/router';
import baseUrl from './baseUrl';
import catchError from './catchErrors';

const Axios = axios.create({
  baseURL: `${baseUrl}/api/profile`,
  headers: { Authorization: Cookies.get('token') },
});

export const followUser = async (userToFollowId, setLoggedUserFollowStats) => {
  console.log(userToFollowId);
  try {
    const res = await Axios.post(`/follow/${userToFollowId}`);
    console.log(res.status);
    setLoggedUserFollowStats((prev) => ({
      ...prev,
      following: [...prev.following, { user: userToFollowId }],
    }));
  } catch (error) {
    alert(catchError(error));
  }
};

export const unFollowUser = async (
  userToUnfollowId,
  setLoggedUserFollowStats
) => {
  console.log(userToUnfollowId);
  try {
    const res = await Axios.post(`/unfollow/${userToUnfollowId}`);
    console.log(res.status);
    setLoggedUserFollowStats((prev) => ({
      ...prev,
      following: prev.following.filter((f) => f.user !== userToUnfollowId),
    }));
  } catch (error) {
    alert(catchError(error));
  }
};

export const profileUpdate = async (
  profile,
  setLoading,
  setError,
  profilePicUrl
) => {
  try {
    const { bio, facebook, twitter, instagram, youtube } = profile;
    await Axios.post('/update', {
      bio,
      facebook,
      twitter,
      instagram,
      youtube,
      profilePicUrl,
    });
    Router.reload();
  } catch (error) {
    setError(error);
  }
  setLoading(false);
};

export const updatePassword = async (setSuccess, passwords) => {
  try {
    await Axios.post('/settings/password', { ...passwords });
    setSuccess(true);
  } catch (error) {
    setError(error);
  }
};

export const updateMessagePopup = async (setMessagePopup, setSuccess) => {
  try {
    await Axios.post('/settings/messagePopup');
    setMessagePopup((messagePopup) => !messagePopup);
    setSuccess(true);
  } catch (error) {
    setError(error);
  }
};
