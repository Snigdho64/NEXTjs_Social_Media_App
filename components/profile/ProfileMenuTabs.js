import React from 'react';
import { Menu } from 'semantic-ui-react';

export default function ProfileMenuTabs({
  activeTab,
  handleActiveTab,
  followers,
  following,
  ownAccount,
  userFollowStats,
}) {
  return (
    <>
      <Menu pointing secondary>
        <Menu.Item
          name="profile"
          active={activeTab === 'profile'}
          onClick={() => handleActiveTab('profile')}
        />
        <Menu.Item
          name={`${followers.length} followers`}
          active={activeTab === 'followers'}
          onClick={() => handleActiveTab('followers')}
        />
        {ownAccount ? (
          <>
            <Menu.Item
              name={`${userFollowStats.following.length || 0} following`}
              active={activeTab === 'following'}
              onClick={() => handleActiveTab('following')}
            />
            <Menu.Item
              name="update profile"
              active={activeTab === 'updateProfile'}
              onClick={() => handleActiveTab('updateProfile')}
            />
            <Menu.Item
              name="settings"
              active={activeTab === 'settings'}
              onClick={() => handleActiveTab('settings')}
            />
          </>
        ) : (
          <>
            <Menu.Item
              name={`${following.length} following`}
              active={activeTab === 'following'}
              onClick={() => handleActiveTab('following')}
            />
          </>
        )}
      </Menu>
    </>
  );
}
