require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
// const cookieParser = require('cookie-parser');
require('../src/db/conn');
const Register = require('./models/register');
const auth = require('./middleware/auth');
const app = express();
const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname, '../public');
const templatePath = path.join(__dirname, '../templates/views');
const partialPath = path.join(__dirname, '../templates/partials');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticPath));
app.set('view engine', 'hbs');
app.set('views', templatePath);
hbs.registerPartials(partialPath); // to use partials

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/secret', auth, (req, res) => {
  res.render('secret');
});
app.get('/logout', auth, async (req, res) => {
  try {
    // for remove single token /logout from single device
    // req.user.tokens = req.user.tokens.filter((currentElement) => {
    //   return currentElement.token !== req.token;
    // });
    // req.token i.e. current token
    req.user.tokens = []; // logout from all devices
    res.clearCookie('jwt');
    await req.user.save();
    res.render('login');
  } catch (e) {
    res.status(500).send(e);
  }
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/register', async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password == cpassword) {
      const registerEmp = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        age: req.body.age,
        password: password,
        confirmpassword: cpassword,
      });
      console.log('success part', registerEmp);
      const token = await registerEmp.generateAuthToken();
      console.log('reg token part', token);

      // The res.cookie() function is used to set the cookie name to value.
      // The value parameter may be a string or object converted to json

      // syntax
      // res.cookie(name,value,[Options])
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });

      const registered = await registerEmp.save();
      console.log('registered part', registered);
      res.status(201).render('index');
    } else {
      res.send('password not match');
    }
  } catch (e) {
    res.status(400).send(e);
    console.log('Error part ');
  }
});

// login check

app.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userEmail = await Register.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, userEmail.password);
    const token = await userEmail.generateAuthToken();

    console.log('login token part', token);
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
    });
    // console.log(`cookis ${req.cookies.jwt}`);

    console.log(isMatch);
    if (isMatch) {
      // res.status(201).render('index');
      // const token = await registerEmp.generateAuthToken();

      // res.send(userEmail);
      res.status(201).render('index');
    } else {
      res.send('invalid login details');
    }
  } catch (e) {
    res.status(400).send('400 invalid login details');
  }
});

/// jwt
// const jwt = require('jsonwebtoken');

// const createToken = async () => {
//   const token = await jwt.sign(
//     { _id: '62428535bdff084ab13e7230' },
//     'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasassasassasassasassasasassasassa',
//     {
//       expiresIn: '10 seconds',
//     }
//   );
//   console.log('JWT', token);
//   const userVar = await jwt.verify(
//     token,
//     'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasassasassasassasassasasassasassa'
//   );
//   console.log(userVar);
// };
// createToken();

app.listen(port, () => {
  console.log(`server is running at port : ${port}`);
});
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjQyZjBiZmIyZTBkMmY3YzIwMDMzMjAiLCJpYXQiOjE2NDg1NTg5MDN9.1vCn9sfIAr9ksty59jDJ7r0Z-1tT-0j2MCevIhnTarI
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjQyZjBiZmIyZTBkMmY3YzIwMDMzMjAiLCJpYXQiOjE2NDg1NTg4Nzd9.4YoE2RLoR4jDh5h1ic5v4UWCytYqgawpstfzb0a-HTc
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjQyZjBiZmIyZTBkMmY3YzIwMDMzMjAiLCJpYXQiOjE2NDg1NTg5MDN9.1vCn9sfIAr9ksty59jDJ7r0Z-1tT-0j2MCevIhnTarI
