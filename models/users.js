const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  password: {
    type: String,
    validate: {
      validator: function (value) {
        return value && value.length >= 6;
      },
      message: 'Password must be at least 6 characters long.',
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;