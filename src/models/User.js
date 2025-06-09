import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'Please add a Firstname'],
  },
  lastname: {
    type: String,
    required: [true, 'Please add an Lastname'],
  },
  bussinessemail: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  phonenumber: {
    type: String,
    required: [true, 'Please add an PhoneNumber'],
  },
  company: {
    type: String,
    required: [true, 'Please add an company'],
  },
  avatar: {
    type: String,
    required: [false, 'Please add an Profile Image'],
  },

  jobRole: {
    type: String,
    required: [true, 'Please add an JobRole'],
   
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  resetPasswordToken:{
    type: String,
  },
  resetPasswordExpire:{
    type: Date,
  },
  branding: {
    logo: String,
    primaryColor: {
      type: String,
      default: '#FF0000'
    },
  },
  secondaryColor: {
    type: String,
    default: '#000000'
  },
  addresses: [{
    name: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  console.log('Enter into presave');
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema,'users');