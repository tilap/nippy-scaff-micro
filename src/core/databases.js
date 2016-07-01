import { mongooseConnection } from 'nippy-core-lib';
import loggerFactory from './factory/logger';
import { databases } from '../app/config/server';

const serverLogger = loggerFactory('core', { message_prefix: 'db factory' });

let dbs = {};
Object.keys(databases).forEach((id) => {
  const url = databases[id];
  serverLogger.verbose(`Create database connection #${id}`);
  dbs[id] = mongooseConnection({ id, url, logger: loggerFactory('core', {
    message_prefix: `db #${id}`,
  }) });
});

export default dbs;
