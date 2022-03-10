import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Message, Divider } from 'semantic-ui-react';
import CommonInput from '../Common/CommonInput';
import ImageDropDiv from '../Common/ImageDropDiv';
import uploadPic from '../../utils/uploadPicToCloudinary';
import { profileUpdate } from '../../utils/profileActions';

export default function UpdateProfile({ Profile }) {
  const [profile, setProfile] = useState({
    profilePicUrl: Profile.user.profilePicUrl,
    bio: Profile.bio,
    facebook: Profile.social?.facebook || '',
    instagram: Profile.social?.instagram || '',
    twitter: Profile.social?.twitter || '',
    youtube: Profile.social?.youtube || '',
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const mediaRef = useRef();

  const inputChangeHandler = (e) => {
    const { name, value, files } = e.target;
    if (name === 'media') {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let profilePicUrl;
      if (media !== null) {
        profilePicUrl = await uploadPic(media);
      }
      if (media !== null && !profilePicUrl) {
        setLoading(false);
        return setErrorMsg('Error Uploading Image');
      }
      await profileUpdate(profile, setLoading, setErrorMsg, profilePicUrl);
    } catch (error) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Form onSubmit={handleSubmit} error={errorMsg !== null} loading={loading}>
        <Message
          error
          content={errorMsg}
          onDismiss={() => setErrorMsg(null)}
          attached
          header="Opps!"
        />
        <ImageDropDiv
          inputRef={mediaRef}
          highlighted={highlighted}
          setHighlighted={setHighlighted}
          onChange={inputChangeHandler}
          mediaPreview={mediaPreview}
          setMedia={setMedia}
          setMediaPreview={setMediaPreview}
          profilePicUrl={profile.profilePicUrl}
        />
        <CommonInput
          user={profile}
          onChange={inputChangeHandler}
          showSocialLinks={showSocialLinks}
          setShowSocialLinks={setShowSocialLinks}
        />
        <Divider hidden />
        <Button
          color="blue"
          icon="pencil alternate"
          disabled={(profile.bio = '' || loading)}
          content="submit"
          type="submit"
        />
      </Form>
    </>
  );
}
