const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const employeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// generate token

employeeSchema.methods.generateAuthToken = async function () {
  try {
    console.log('_ID>', this._id.toString());
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (e) {
    // console.log(e);
    res.send('send ERROR>', e);
    console.log('ERROR', e);
  }
};

employeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    demo = await bcrypt.hash(this.password, 10);
    this.password = demo;

    this.confirmpassword = demo;
  }
  next();
});

const Register = new mongoose.model('Register', employeeSchema);

module.exports = Register;
