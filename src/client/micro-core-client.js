import { coreApiUrl } from '../app/config/env';
import client from './versions/micro-core-client-1.2.1';

const coreApiCli = new client({ endpoint: coreApiUrl });
module.exports = coreApiCli;
