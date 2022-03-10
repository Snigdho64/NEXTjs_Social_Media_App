import axios from 'axios';
import Cookies from 'js-cookie';
import baseUrl from './baseUrl';

const getUserInfo = async (userId) => {
  try {
    const res = await axios.get(`${baseUrl}/api/chats/user/${userId}`, {
      headers: {
        Authorization: Cookies.get('token'),
      },
    });
    return { ...res.data };
  } catch (error) {
    console.log(error);
  }
};

export default getUserInfo;
