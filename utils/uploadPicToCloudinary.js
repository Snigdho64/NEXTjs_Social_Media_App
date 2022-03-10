import axios from 'axios';

const uploadPic = async (media) => {
  try {
    const form = new FormData();
    form.append('file', media);
    form.append('upload_preset', 'Social_Media_App');
    form.append('cloud_name', 'snigdho');

    const res = await axios.post(process.env.CLOUDINARY_URL, form);
    return res.data.url;
  } catch (error) {
    console.log(error);
    return;
  }
};

export default uploadPic;
