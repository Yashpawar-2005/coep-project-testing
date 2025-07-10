import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

async function connectDatabases() {
  try {
    console.log(process.env.DATABASE_URL)
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL (via Neon.tech)');
    redis.on('error', (err) => console.error('❌ Redis Error:', err));
    await redis.connect();
    console.log('✅ Connected to Redis (via Docker)');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

export { prisma, redis, connectDatabases };
