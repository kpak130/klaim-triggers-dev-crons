import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';
import path from 'path';

// Load .env from parent directory
config({ path: path.resolve(__dirname, '..', '.env') });

export default defineConfig({
  schema: 'schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});