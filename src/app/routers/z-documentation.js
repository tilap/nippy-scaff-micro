import serverConfig from '../config/server';
import parameters from '../config/parameters';
import errorsConfig from '../../core/config/errors';

const mainPath = '/documentation';

let documentationRoute = {};

// Main api info and documentation links
documentationRoute.getDocumentationMain = {
  method: 'get',
  path: mainPath,
  dispatch: async (ctx, next) => {
    let documentationContent = {};
    if (parameters.application) {
      documentationContent = parameters.application;
    }
    documentationContent.links = {
      methods: `${mainPath}/methods`,
      errors: `${mainPath}/errors`,
    };
    if (['development', 'test'].indexOf(serverConfig.environment) > -1) {
      documentationContent.links.config = `${mainPath}/config`;
    }
    ctx.apiResponse.setData(documentationContent);
    await next();
  },
  description: 'Give main api information such as version, name, author, documentation links...',
  args: {
    params: null,
    get: null,
    data: null,
  },
  results: {
    single: true,
  },
};

// List of errors, code and message
let errorsDocumentation = [];
Object.keys(errorsConfig).forEach((name) => {
  const code = errorsConfig[name].code;
  const message = errorsConfig[name].message;
  errorsDocumentation.push({
    code,
    name,
    message,
    description: `${name} error is sent with code ${code} when ${message}`,
  });
});

documentationRoute.getDocumentationErrors = {
  method: 'get',
  path: `${mainPath}/errors`,
  dispatch: async (ctx, next) => {
    ctx.apiResponse.addData(errorsDocumentation);
    await next();
  },
  description: 'Give api available errors code, name, description',
  args: {
    params: null,
    get: null,
    data: null,
  },
  results: {
    single: false,
  },
};


// Api configuration
// Warning: should be usefull on dev on internal use, dangerous to expose on production
if (['development', 'test'].indexOf(serverConfig.environment) > -1) {
  documentationRoute['getDocumentationConfig'] = {
    method: 'get',
    path: `${mainPath}/config`,
    dispatch: async (ctx, next) => {
      ctx.apiResponse.addData({
        server: serverConfig,
        parameters,
      });
      await next();
    },
    description: 'Configuration content',
    args: {
      params: null,
      get: null,
      data: null,
    },
    results: {
      single: false,
    },
  };
}

module.exports = documentationRoute;
