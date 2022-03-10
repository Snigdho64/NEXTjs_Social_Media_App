import React from 'react';
import { Grid, Image, Segment } from 'semantic-ui-react';

export default function Banner({ bannerData }) {
  const { name, profilePicUrl } = bannerData;
  return (
    <Segment>
      <Grid>
        <Grid.Column width={14} floated="left">
          <h4>
            <Image avatar src={profilePicUrl} />
            {name}
          </h4>
        </Grid.Column>
      </Grid>
    </Segment>
  );
}
