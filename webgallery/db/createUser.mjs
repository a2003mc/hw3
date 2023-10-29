import path from 'path';
import { fileURLToPath } from 'url';
import Datastore from 'nedb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const userDb = new Datastore({ filename: path.join(__dirname, '/userDb.db'), autoload: true });
