import { errorFactory } from 'nippy-core-lib';
const config = require('./config/errors');

module.exports = errorFactory(config);
