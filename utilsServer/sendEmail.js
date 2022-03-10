const nodemailer = require('nodemailer');
const sibTransport = require('nodemailer-sendinblue-transport');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendEmail = async (user, link) => {
  try {
    const data = await transporter.sendMail({
      to: 'aexseusidparker64@gmail.com',
      from: 'aexseusidparker@gmail.com',
      subject: 'Social App Password Reset',
      html: `<body style={display:flex,align-items:center,justify-content:center}>
    <h3>Hi <b>${user.username}</b>,
    This is a password reset email
    </h3>
    <strong>
    <a href=${link}>Click Here </a>
    to reset your password
    </strong>
    <p>This token is valid for only 1 hour.</p>
    <p><span style={color;'red',font-weight:'bold'}>Warning</span>:Please do not reply if it's not for you.</p>
    <h3 style={color='teal',text-align:'right'}>MERN SOCIAL MEDIA</h3>`,
    });
    return { success: true, data };
  } catch (e) {
    console.log(e);
    return { error: e };
  }
};

module.exports = sendEmail;
