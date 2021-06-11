const urlsForUser = (id, database) => {
  const ret = {}
  for (const url in database) {
    if (database[url].userID === id) {
      ret[url] = database[url].longURL;
    }
  }
  return ret;
};

const generateRandomString = () => {
  const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
  let ret = "";
  for (let i = 1; i <= 6; i++) {
    let randNum = Math.floor(Math.random() * alphanumeric.length);
    ret += alphanumeric[randNum];
  }
  return ret;
};

// Checks if user already exists for POST /register
const getUserByEmail = (userEmail, database) => {
  for (const user in database) {
    if (database[user].email === userEmail) {
      return user;
    }
  }
};

module.exports = {
  urlsForUser,
  generateRandomString,
  getUserByEmail,
};