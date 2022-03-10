import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';
import baseUrl from '../utils/baseUrl';
import axios from 'axios';
import { NoProfile, NoProfilePosts } from '../components/Layout/NoData';
import Cookies from 'js-cookie';
import { PostDeleteToastr } from '../components/Layout/Toastr';
import { Grid } from 'semantic-ui-react';
import ProfileMenuTabs from '../components/profile/ProfileMenuTabs';
import ProfileHeader from '../components/profile/ProfileHeader';
import { PlaceHolderPosts } from '../components/Layout/PlaceHolderGroup';
import CardPost from '../components/Post/CardPost';
import Followers from '../components/profile/Followers';
import Following from '../components/profile/Following';
import UpdateProfile from '../components/profile/UpdateProfile';
import Settings from '../components/profile/Settings';

export default function ProfilePage({
  user,
  userFollowStats,
  profile,
  followers,
  following,
  errorLoading,
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showToastr, setShowToastr] = useState(false);
  const router = useRouter();
  const [loggedUserFollowStats, setLoggedUserFollowStats] =
    useState(userFollowStats);

  const { username } = router.query;

  const ownAccount = profile.user._id === user._id;

  const handleTabClick = (tab) => setActiveTab(tab);

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const { data, statusText } = await axios.get(
          `${baseUrl}/api/profile/${username}/posts`,
          { headers: { Authorization: Cookies.get('token') } }
        );
        if (statusText === 'OK') {
          setPosts(data);
        } else {
          throw new Error('Fetching Posts Failed');
        }
      } catch (err) {
        console.log(err.message);
      }
      setLoading(false);
    };
    getPosts();
  }, [username]);

  if (errorLoading || !profile) return <NoProfile />;

  useEffect(() => {
    showToastr && setTimeout(() => setShowToastr(false), 4000);
  }, [showToastr]);

  return (
    <>
      {showToastr && <PostDeleteToastr />}
      <Grid stackable>
        <Grid.Row>
          <Grid.Column>
            <ProfileMenuTabs
              activeTab={activeTab}
              ownAccount={ownAccount}
              followers={followers}
              following={following}
              userFollowStats={loggedUserFollowStats}
              handleActiveTab={handleTabClick}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            {activeTab === 'profile' && (
              <>
                <ProfileHeader
                  loggedUserFollowStats={loggedUserFollowStats}
                  ownAccount={ownAccount}
                  profile={profile}
                  setLoggedUserFollowStats={setLoggedUserFollowStats}
                />
                {loading ? (
                  <PlaceHolderPosts />
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <CardPost
                      key={post._id}
                      post={post}
                      user={user}
                      setPosts={setPosts}
                      setShowToastr={setShowToastr}
                    />
                  ))
                ) : (
                  <NoProfilePosts />
                )}
              </>
            )}
            {activeTab === 'followers' && (
              <Followers
                user={user}
                profile={profile}
                loggedUserFollowStats={loggedUserFollowStats}
                setLoggedUserFollowStats={setLoggedUserFollowStats}
              />
            )}
            {activeTab === 'following' && (
              <Following
                user={user}
                profile={profile}
                loggedUserFollowStats={loggedUserFollowStats}
                setLoggedUserFollowStats={setLoggedUserFollowStats}
              />
            )}
            {activeTab === 'updateProfile' && (
              <UpdateProfile Profile={profile} />
            )}
            {activeTab === 'settings' && <Settings />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
}

ProfilePage.getInitialProps = async (ctx) => {
  const { username } = ctx.query;
  const { token } = parseCookies(ctx);
  try {
    const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
      headers: { Authorization: token },
    });
    console.log(res.data);
    return res.status === 200
      ? { ...res.data }
      : { profile: {}, followers: [], following: [] };
  } catch (e) {
    console.log(e.message);
    return { setErrorLoading: true };
  }
};
