import bcrypt from 'bcryptjs';
import { prisma } from '../db/Connect.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { name: name },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or name already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, secure: false });

    res.status(201).json({ message: 'User created', data:user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, secure: false });

    res.json({ message: 'Login successful', data:user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};
