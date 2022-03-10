import App from 'next/app';
import Layout from '../components/Layout/Layout';
import '../styles/globals.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { destroyCookie, parseCookies } from 'nookies';
import { redirectUser } from '../utils/authUser';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import 'cropperjs/dist/cropper.css';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { token } = parseCookies(ctx);

    let pageProps = {};

    // console.log(ctx);
    const protectedRoutes =
      ctx.pathname === '/' ||
      ctx.pathname === '/[username]' ||
      ctx.pathname === '/notifications' ||
      ctx.pathname === '/post' ||
      ctx.pathname === '/post/[postId]' ||
      ctx.pathname === '/messages' ||
      ctx.pathname === '/search';

    if (!token) {
      protectedRoutes && redirectUser(ctx, '/login');
    } else {
      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
      }
      try {
        const res = await axios.get(`${baseUrl}/api/auth`, {
          headers: {
            Authorization: token,
          },
        });

        const { user, userFollowStats } = res.data;
        if (user) !protectedRoutes && redirectUser(ctx, '/');

        pageProps.user = user;
        pageProps.userFollowStats = userFollowStats;
      } catch (error) {
        destroyCookie(ctx, 'token');
        redirectUser(ctx, '/login');
      }
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Layout {...pageProps}>
        <Component {...pageProps} />
      </Layout>
    );
  }
}

export default MyApp;
