const environment = process.env.NODE_ENV || 'production';
if (['development', 'test', 'production'].indexOf(environment) < 0) {
  throw new ConfigurationError(`Unexpected NODE_ENV environement, current value "${environment}", expect 'development', 'test' or 'production'`);
}

const databaseMain = process.env.DATABASES_MAIN || '';
if (!databaseMain) throw new ConfigurationError('DATABASES_MAIN environement error, current value is missing or empty');

const port = process.env.PORT || 3000;
if (!port || !('' + port).match(/^\d+$/)) throw new ConfigurationError(`Unexpected PORT environement var, current value "${port}", expect an integer`);

const webUrl = process.env.WEB_URL || '';
if (!webUrl) throw new ConfigurationError('WEB_URL environement error, current value is missing or empty');

const logsPath = process.env.LOG_PATH || '';
if (!logsPath) throw new ConfigurationError('LOG_PATH environement error, current value is missing or empty');

const conreApiUrl = process.env.CORE_API_URL || '';
if (!conreApiUrl) throw new ConfigurationError('CORE_API_URL environement error, current value is missing or empty');

module.exports = { environment, databaseMain, port, webUrl, logsPath };
