import { Router } from 'nippy-core-lib';

module.exports = class CoreRouter extends Router {
  constructor(options) {
    super(options);
    this.documentation = {
      id: (options.documentation && options.documentation.id) ? options.documentation.id : 'getDocumentationMethods',
      path: (options.documentation && options.documentation.path) ? options.documentation.path : '/documentation/methods',
      method: (options.documentation && options.documentation.method) ? options.documentation.method : 'get',
      description: (options.documentation && options.documentation.description) ? options.documentation.description : 'Provide full api documentation',
    };
  }

  addDocumentation({ id = '', path = '', method = '', description = '' } = {}) {
    id = id || this.documentation.id;
    path = path || this.documentation.path;
    method = method || this.documentation.method;
    description = description || this.documentation.description;

    this.routesConfig[id] = {
      method,
      description,
      path,
      dispatch: async (ctx, next) => {
        Object.keys(this.routesConfig).forEach((name) => {
          const {
            method = 'get',
            path = '',
            description = '',
            args = {
              params: null,
              get: null,
              data: null,
            },
            results = {
              single: false,
            },
          } = this.routesConfig[name];
          ctx.apiResponse.addData({ name, method, path, description, args, results });
        });
      },
    };
    return this;
  }
};
