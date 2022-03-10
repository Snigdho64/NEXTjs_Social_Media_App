import React, { useState } from 'react';
import {
  Button,
  Divider,
  Grid,
  Header,
  Image,
  List,
  Segment,
} from 'semantic-ui-react';
import { followUser, unFollowUser } from '../../utils/profileActions';

export default function ProfileHeader({
  profile,
  ownAccount,
  loggedUserFollowStats,
  setLoggedUserFollowStats,
}) {
  const [loading, setLoading] = useState(false);

  const isFollowing =
    loggedUserFollowStats.following
      .map((f) => f.user)
      .indexOf(profile.user._id) > -1;

  return (
    <>
      <Segment>
        <Grid stackable>
          <Grid.Column width={11}>
            <Grid.Row>
              <Header
                as="h2"
                content={profile.user.name}
                style={{ marginBottom: '15px' }}
              />
            </Grid.Row>
            <Grid.Row stretched>
              {profile.bio}
              <Divider hidden />
            </Grid.Row>
            <Grid.Row>
              {profile.social ? (
                <List>
                  <List.Item>
                    <List.Icon name="mail" />
                    <List.Content content={profile.user.email} />
                  </List.Item>
                  {profile.social.facebook && (
                    <List.Item>
                      <List.Icon name="facebook" color="blue" />
                      <List.Content
                        style={{ color: 'blue' }}
                        content={profile.social.facebook}
                      />
                    </List.Item>
                  )}
                  {profile.social.instagram && (
                    <List.Item>
                      <List.Icon name="instagram" color="red" />
                      <List.Content
                        style={{ color: 'blue' }}
                        content={profile.social.instagram}
                      />
                    </List.Item>
                  )}
                  {profile.social.twitter && (
                    <List.Item>
                      <List.Icon name="twitter" color="blue" />
                      <List.Content
                        style={{ color: 'blue' }}
                        content={profile.social.twitter}
                      />
                    </List.Item>
                  )}
                  {profile.social.youtube && (
                    <List.Item>
                      <List.Icon name="youtube" color="red" />
                      <List.Content
                        style={{ color: 'blue' }}
                        content={profile.social.youtube}
                      />
                    </List.Item>
                  )}
                </List>
              ) : (
                <>No Social Media Links</>
              )}
            </Grid.Row>
          </Grid.Column>
          <Grid.Column width={5} stretched style={{ textAlign: 'center' }}>
            <Grid.Row>
              <Image src={profile.user.profilePicUrl} size="large" avatar />
            </Grid.Row>
            <br />
            {!ownAccount && (
              <Button
                compact
                loading={loading}
                disabled={loading}
                content={isFollowing ? 'Following' : 'Follow'}
                icon={isFollowing ? 'check circle' : 'add user'}
                color={isFollowing ? 'instagram' : 'facebook'}
                onClick={async () => {
                  setLoading(true);
                  isFollowing
                    ? await unFollowUser(
                        profile.user._id,
                        setLoggedUserFollowStats
                      )
                    : followUser(profile.user._id, setLoggedUserFollowStats);
                  setLoading(false);
                }}
              />
            )}
          </Grid.Column>
        </Grid>
      </Segment>
    </>
  );
}
