import { ConfigurationError } from '../../core/errors';
import { environment, databaseMain, port, webUrl, logsPath } from './env.js';

module.exports = {
  databases: {
    main: databaseMain,
  },
  databasesModels: {
    '*': process.env.DATABASES_MODELS_DEFAULT || 'main',
    user: 'main',
  },
  debug: environment === 'development',
  environment,
  jwt: { getName: 'access_token' },
  logs: {
    transporters: {
      file: {
        transport: 'file',
        options: {
          filename: `${logsPath}/default.log`,
          level: environment === 'production' ? 'info' : 'error',
        },
      },
      console: {
        transport: 'console',
        options: {
          level: environment === 'production' ? 'info' : 'silly',
        },
      },
    },
    loggers: {
      controller: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/controller.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'controller' },
        },
      ],
      core: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/server.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'server' },
        },
      ],
      request: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/requests.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'request' },
        },
      ],
      services: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/service.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'service' },
        },
      ],
      app: [
        {
          transporter: 'file',
          options: { filename: `${logsPath}/app.log` },
        }, {
          transporter: 'console',
          options: { message_prefix: 'app' },
        },
      ],
    },
  },
  port,
  urls: {
    root: webUrl,
    root_path: '/api/v1',
  },
};
