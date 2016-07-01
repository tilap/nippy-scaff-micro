global.fetch = require('node-fetch');

import path from 'path';
import Koa from 'koa';
import koaBodyParserMiddleware from 'koa-bodyparser';
import { cors as koaCorsMiddleware } from 'koa-middleware';
import { responseTime as koaResponseTimeMiddleware } from 'koa-middleware';
import koaRequestLogMiddleware from 'koa-request-logger';
import koaStateMiddleware from 'koa-state';
import { apiResponseKoaMiddleware, apiResponseKoaMiddlewareHelpers } from 'nippy-core-lib';

import Router from '../core/class/router';
import loggerFactory from '../core/factory/logger';
import ServiceFactory from '../core/factory/service';

import coreApiCli from '../client/micro-core-client';

process.on('unhandledRejection', (reason) => {
  console.error(`Unhandle promise rejection: ${reason}`); // eslint-disable-line no-console
  console.error(reason); // eslint-disable-line no-console
  try {
    loggerFactory('core', { message_prefix: 'unhandle promise' }).error(reason);
  } catch (err) {} // eslint-disable-line no-empty
});

try {
  // Config
  const serverConfig = require('./config/server');
  const parameters = require('./config/parameters');

  // ===========================================================================
  // App =======================================================================
  // ===========================================================================

  const app = new Koa();

  app.use(koaBodyParserMiddleware());
  app.use(koaCorsMiddleware());
  app.use(koaResponseTimeMiddleware());
  app.use(koaRequestLogMiddleware({ logger: loggerFactory('request'), method: 'verbose' }));

  // ===========================================================================
  // Api router ================================================================
  // ===========================================================================
  const router = new Router({
    prefix: serverConfig.urls.root_path,
    logger: loggerFactory('core', { message_prefix: 'router' }),
    controllerPath: path.resolve(__dirname, parameters.paths.controllers),
  });

  // context state
  router.use(koaStateMiddleware());

  // Services in router
  router.use(async (ctx, next) => {
    ctx.getService = (serviceId) => {
      const serviceFactory = new ServiceFactory();
      if (ctx.hasState('user')) {
        serviceFactory.addInitializer((service) => service.setContextUser(ctx.getState('user')));
      }
      return serviceFactory.get(serviceId);
    };
    await next();
  });

  // Api middleware output
  router.use(apiResponseKoaMiddleware({
    showStackTraceOnError: serverConfig.debug,
    logger: loggerFactory('core', { message_prefix: 'api middleware' }),
  }));
  router.use(apiResponseKoaMiddlewareHelpers());

  // Controller dispatch option
  router.addBeforeRunningController(({ ctx, router, name } = {}) => {
    loggerFactory('core', { message_prefix: 'controller dispatch' }).verbose(`Dispatch route ${name}`);
    ctx.apiResponse.setSource(name);
  });
  router.addAfterRunningController(({ ctx, router } = {}) => ctx.response.status = 200);

  // Set user state from a GET jwt token
  router.use(async (ctx, next) => {
    const getKey = serverConfig.jwt.getName;
    const token = ctx.query && ctx.query[getKey] ? ctx.query[getKey] : '';

    if (token) {
      coreApiCli.setToken(token);
      let user = await coreApiCli.getCurrentUser();
      coreApiCli.setToken('');
      if (user) {
        ctx.setState('user', user);
        ctx.apiResponse.setMeta('user', ctx.getState('user'));
        ctx.apiResponse.setMeta('rights', ctx.getState('user').rights);
      }
    }
    await next();
    if (ctx.hasState('user')) {
      ctx.apiResponse.setMeta('user', ctx.getState('user'));
      ctx.apiResponse.setMeta('rights', ctx.getState('user').rights);
    }
  });

  // Init routes
  router.addRoutesFromConfigFolders(path.resolve(__dirname, parameters.paths.routers))
        .addDocumentation()
        .init();

  // ===========================================================================
  // Start =====================================================================
  // ===========================================================================

  app.use(router.routes()).use(router.allowedMethods());
  app.listen(serverConfig.port, () => loggerFactory('core').info(`Listening on port ${serverConfig.port}`));
} catch (err) {
  console.error(`ERROR in main loop: ${err.message || err}`); // eslint-disable-line no-console
  console.error(err.stack); // eslint-disable-line no-console
}
