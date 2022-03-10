module.exports.validateUsername = (username) => {
  const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
  return regexUserName.test(username);
};
