import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  // @ts-ignore
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};