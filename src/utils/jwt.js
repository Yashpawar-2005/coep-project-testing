import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET);
};
