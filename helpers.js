/**
 * Searches for all the urls that belongs to a user
 * 
 * @param {String} id 
 * @param {Object} database 
 * @returns Object
 */
const urlsForUser = (id, database) => {
  const ret = {}
  for (const url in database) {
    if (database[url].userID === id) {
      ret[url] = database[url].longURL;
    }
  }
  return ret;
};

/**
 * Generates a random string of length 6
 * 
 * @returns String
 */
const generateRandomString = () => {
  const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
  let ret = "";
  for (let i = 1; i <= 6; i++) {
    let randNum = Math.floor(Math.random() * alphanumeric.length);
    ret += alphanumeric[randNum];
  }
  return ret;
};

/**
 * Searches for a user based on the given email
 * 
 * @param {String} userEmail 
 * @param {Object} database 
 * @returns Object
 */
const getUserByEmail = (userEmail, database) => {
  for (const user in database) {
    if (database[user].email === userEmail) {
      return user;
    }
  }
};

/**
 * Finds if a user already exists in the database
 * 
 * @param {String} cookieID 
 * @param {Object} database 
 * @returns Object
 */
const userExist = (cookieID, database) => {
  if (database[cookieID]) {
    return database[cookieID];
  }
  return {};
};

module.exports = {
  urlsForUser,
  generateRandomString,
  getUserByEmail,
  userExist
};