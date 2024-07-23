import * as dotenv from 'dotenv';
import * as path from 'path';

if (!(process.env.PRODUCTION && process.env.PRODUCTION.toLowerCase() == 'true'))
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface ApiEnvironment {
  production: boolean;
  windolarBaseUrl: string;
  windolarEmail: string;
  windolarPassword: string;
  botToken: string;
}

const environment: ApiEnvironment = {
  production: process.env.PRODUCTION == 'true' ? true : false,
  windolarBaseUrl: process.env.WINDOLAR_BASE_URL ?? '',
  windolarEmail: process.env.WINDOLAR_EMAIL ?? '',
  windolarPassword: process.env.WINDOLAR_PASSWORD ?? '',
  botToken: process.env.BOT_TOKEN ?? '',
};

export default environment;
