import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const adapter = new PrismaPg(new pg.Pool({
  connectionString: process.env.DATABASE_URL,
}));

export default {
  schema: path.join(__dirname, 'schema.prisma'),
  adapter,
};