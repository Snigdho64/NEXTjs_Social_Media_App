import axios from 'axios';
import Router from 'next/router';
import baseUrl from './baseUrl';
import cookie from 'js-cookie';
import catchError from './catchErrors';

const getToken = (token) => {
  cookie.set('token', token);
  Router.push('/');
};

export const redirectUser = (ctx, location) => {
  if (ctx.req) {
    // For Server-Side
    ctx.res.writeHead(301, { location: location });
    ctx.res.end();
  } else {
    // For Client-Side
    Router.push(location);
  }
};

export const logoutUser = (email) => {
  cookie.set('userEmail', email);
  cookie.remove('token');
  Router.push('/login');
  Router.reload();
};

export const registerUser = async (
  user,
  profilePicUrl,
  setError,
  setLoading
) => {
  try {
    const res = await axios.post(`${baseUrl}/api/signup`, {
      user,
      profilePicUrl,
    });
    getToken(res.data);
  } catch (e) {
    const errorMsg = catchError(e);
    setError(errorMsg);
  }
  setLoading(false);
};

export const loginUser = async (user, setError, setLoading) => {
  setLoading(true);
  try {
    const res = await axios.post(`${baseUrl}/api/auth`, {
      user,
    });
    getToken(res.data);
  } catch (e) {
    const errorMsg = catchError(e);
    setError(errorMsg);
  }
  setLoading(false);
};
