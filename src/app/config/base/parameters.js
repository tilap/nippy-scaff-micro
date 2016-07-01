import pckg from '../../../package.json';

module.exports = {
  application: {
    name: pckg.name || 'unknown',
    description: pckg.description || 'unknown',
    version: pckg.version || 'unknown',
  },
  paths: {
    routers: 'routers',
    models: 'models',
    services: 'services',
    controllers: 'controllers',
    events: 'events',
  },
  tokens: {
    version: 1,
  },
};
