const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser, userExist } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "helloWorld"
  },
  "9sm5xK": {
  longURL: "http://www.google.com",
  userID: "user2RandomID"
  },
  "fk82Lf": {
    longURL: "http://www.amazon.ca",
    userID: "helloWorld"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedOutput = "user2RandomID";
    assert.equal(user, expectedOutput);
  });
  
  it('should return undefined', function() {
    const user = getUserByEmail("oop@oops.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
  
  it('should return undefined', function() {
    const user = getUserByEmail("nunpar@moistleaf.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
  
});

describe('generateRandomString', function() {
  it('should return length of 6', function() {
    const randString = generateRandomString();
    const num = 6;
    assert.equal(randString.length, num);
  });
});

describe('urlsForUser', function() {
  it('should return an object', function() {
    const input = urlsForUser("helloWorld", testDatabase);
    const expectedOutput = {
      "b2xVn2": "http://www.lighthouselabs.ca",
      "fk82Lf": "http://www.amazon.ca"
    };
    assert.deepEqual(input, expectedOutput);
  });
});

describe('userExist', function() {
  it('should return an object from the cookie', function() {
    const input = userExist("user2RandomID", testUsers);
    const expectedOutput = {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    };
    assert.deepEqual(input, expectedOutput);
  });

  it('should return an empty object', function() {
    const input = userExist("heyYoMaDood", testUsers);
    assert.deepEqual(input, {});
  });
});