import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabases, prisma, redis } from './db/Connect.js';
import promptroute from './routes/promptroute.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authroute.js';
import userRoutes from './routes/userroute.js';
import teamrouter from './routes/teamroute.js';
import adminrouter from './routes/adminroute.js';
dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
await connectDatabases();
const base_url="/api/v1"

app.use(cors({
  origin: 'http://localhost:5173',           
  credentials: true,        
}));
app.use(express.json());
app.use(cookieParser());
app.use(`${base_url}`,promptroute)
app.use(`${base_url}/user`,userRoutes)
app.use(`${base_url}/auth`,authRoutes)
app.use(`${base_url}/team`,teamrouter)
app.use(`${base_url}/admin`,adminrouter)
app.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const cache = (await redis.get('cache-key')) || 'No cache';
    res.json({ users, cache });
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
