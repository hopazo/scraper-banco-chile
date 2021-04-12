const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  user: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  }
};
