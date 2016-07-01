/*
 * Expose a function to lazy load model based on config
 *
 * @usage:
 * ```
 * const modelFactory = require('model');
 * const myModel = modelFactory('modelId');
 * ```
 */

import path from 'path';
import fs from 'fs';
import { UncaughtError, ConfigurationError } from '../errors';
import databases from '../databases';
import { paths as pathsConfig } from '../../app/config/parameters';
import { databasesModels as databasesModelsConfig } from '../../app/config/server';

// Assume there is a default db in config
if (!databasesModelsConfig['*']) {
  throw new ConfigurationError('No default database (*) for model set in configuration');
}

let cache = {};

module.exports = (id) => {
  if (!cache[id]) {
    // Get DB connexion to use
    const databaseId = databasesModelsConfig[id] ? databasesModelsConfig[id] : databasesModelsConfig['*'];
    if (!databases[databaseId]) {
      throw new ConfigurationError(`Unknown database "${databaseId}"`);
    }
    const dbConnection = databases[databaseId];

    // Model
    const modelFile = path.resolve(__dirname, '../../app/', pathsConfig.models, `${id}.js`);
    try {
      fs.accessSync(modelFile, fs.F_OK);
    } catch (err) {
      throw new UncaughtError(`File "${modelFile}" for model "${id}"  not found`);
    }
    const model = require(modelFile);

    cache[id] = model(dbConnection);
  }
  return cache[id];
};
