const jwt = require('jsonwebtoken');
const Register = require('../models/register');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // get cookies
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

    console.log('AUTH>', verifyUser);
    const user = await Register.findOne({ _id: verifyUser._id });
    console.log('AUTH11>', user.firstname);

    req.token = token;
    req.user = user;

    next();
  } catch (e) {
    res.status(401).send(e);
  }
};
module.exports = auth;
