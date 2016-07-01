import path from 'path';
import fs from 'fs';
import { UncaughtError } from '../errors';
import loggerFactory from './logger';
import modelsLoader from './model';
import parameters from '../../app/config/parameters';
import getServiceEvents from './service-events';

const servicePath = path.resolve(__dirname, '../../app', parameters.paths.services);

let cache = {};

module.exports = class ServiceFactory {
  constructor(options = {}) {
    this.initializers = [];
    const { aclCheck = true } = options;
    this.aclCheck = aclCheck;
  }

  addInitializer(func) {
    this.initializers.push(func);
  }

  getServiceClass(serviceId) {
    if (!cache[serviceId]) {
      const classFile = path.resolve(servicePath, `${serviceId}.js`);
      try {
        fs.accessSync(classFile, fs.F_OK);
      } catch (err) {
        throw new UncaughtError(`File "${classFile}" for service "${serviceId}"  not found`);
      }

      try {
        cache[serviceId] = require(classFile);
      } catch (err) {
        throw new UncaughtError(err.message);
      }
    }

    return cache[serviceId];
  }

  get(serviceId) {
    const ServiceClass = this.getServiceClass(serviceId);

    let service = new ServiceClass();

    // Add events
    let serviceEvents = getServiceEvents(serviceId);
    Object.keys(serviceEvents).forEach((eventName) => serviceEvents[eventName].forEach((cb) => service.addEvent(eventName, cb)));

    // Logger
    service.setLogger(loggerFactory('core', { message_prefix: `service ${serviceId}` }));

    // Model
    service.setModelLoader(modelsLoader);

    // Acl
    if (!this.aclCheck) {
      service.disableAclCheck();
    }

    // Custom
    this.initializers.forEach((init) => service = init(service));

    if (service.setServiceFactory) {
      service.setServiceFactory(this);
    }

    return service;
  }
};
