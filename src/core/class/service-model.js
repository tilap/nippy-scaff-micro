/*
 * A service bound to a model
 * extends ContextService with user statement
 */
import ContextService from './service-context';
import { NotFoundError, ValidationError, UncaughtError } from '../errors';

export default class ModelService extends ContextService {

  constructor({ defaultModelName } = {}) {
    super();
    this.defaultModelName = defaultModelName;
    this.paginationDefault = { page: 1, limit: 15 };
  }

  /**
   * Create a new ressource
   *
   * @param {object} params - object property
   * @return {object} - new saved ressource
   * @error {ValidationError} - mongoose validation error
   */
  async createOne(params) {
    const model = this.getModel();
    const newItem = model(params);
    try {
      const result = await newItem.save();
      this.emit('created', result);
      return result;
    } catch (err) {
      this.logger.verbose(`createOne error ${err.message || err}`);
      throw await model.cleanError(err);
    }
  }

  /**
   * Get a model instance by id
   *
   * @param {integer} id
   * @param {string} modelName - model name
   * @return null - if document not found
   * @return {document}
   * @error {ValidationError} - if id is not valid
   */
  async getById(id) {
    this.assert(!isNaN(id), new ValidationError('id must be an integer', {
      property: 'id',
      type: 'format',
      message: 'must be an integer',
      name: 'ValidatorError', value: id,
    }));
    this.assert(id > 0, new ValidationError('id must be a positive integer', {
      property: 'id',
      type: 'format',
      message: 'id must be a positive integer',
      name: 'ValidatorError', value: id,
    }));
    return await this.getOne({ id });
  }

  async get(params = {}, options = {}) {
    return await this.getModel().find(params, options);
  }

  async getOne(params = {}, options = {}) {
    return await this.getModel().findOne(params, options);
  }

  /**
   * Update a set of documents
   *
   * @param {object} params - a query param object
   * @return {object} - result object
   * @return {object}.documents - list of document ids to update
   * @return {object}.updated - list of document ids updated
   * @return {object}.errors - object of docid => error
   * @return {object}.count - object of documents, updated and errors
   */
  async update(params, newData) {
    if (!params.limit) params.limit = 1000000000;

    const toUpdatePaginated = await this.getPaginated(params);
    const toUpdate = toUpdatePaginated.docs;

    let ids = toUpdate.map((doc) => doc.id);

    let updated = [];
    let errors = {};
    for (let id of ids) {
      try {
        let itemUpdate = await this.updateById(id, newData); // eslint-disable-line babel/no-await-in-loop
        if (itemUpdate.updated) {
          updated.push(id);
          this.emit('updated', itemUpdate);
        } else if (itemUpdate.error) {
          errors[id] = itemUpdate.error;
        }
      } catch (err) {
        this.logger.verbose(`update error ${err.message || err}`);
        errors[id] = err;
      }
    }

    return {
      documents: ids,
      updated,
      errors,
      count: {
        documents: ids.length,
        updated: updated.length,
        errors: Object.keys(errors).length,
      },
    };
  }

  /**
   * Update a document by id (selected via getById)
   *
   * @param {number} id - the id of the document
   * @param {string} modelName - model name
   * @return null - if document not found
   * @return {document} - the updated document
   * @error {ValidationError} - if id is not valid
   */
  async updateById(id, newData) {
    this.assert(!isNaN(id), new ValidationError('id must be an integer', {
      property: 'id',
      type: 'format',
      message: 'must be an integer',
      name: 'ValidatorError', value: id,
    }));
    this.assert(id > 0, new ValidationError('id must be a positive integer', {
      property: 'id',
      type: 'format',
      message: 'id must be a positive integer',
      name: 'ValidatorError', value: id,
    }));

    const originalItem = await this.getById(id);
    let result = {
      document: null,
      updated: null,
      error: null,
    };

    if (originalItem) {
      result.document = originalItem;

      if (Object.keys(newData).length === 0) {
        result.updated = originalItem;
        return result;
      }

      const model = this.getModel();
      try {
        let resultUpdate = await model.update({ id }, { $set: newData }, {
          multi: false,
          runValidators: true,
        });
        if (!resultUpdate.ok || resultUpdate.ok !== 1) {
          result.error = new UncaughtError('Model update error');
        } else if (resultUpdate.nModified === 1) {
          result.updated = await this.getById(id);
          this.emit('updated', { document: result.document, updated: result.updated });
        }
      } catch (err) {
        this.logger.verbose(`updateById error ${err.message || err}`);
        result.error = await model.cleanError(err);
      }
    }

    return result;
  }

  /**
   * Delete a filtered list of items
   * @param {object} params - a query param object
   * @return {array} - list of deleted items
   * @error {UncaughtError} - on deletion error
   */
  async delete(params) {
    const model = this.getModel();

    // @todo: find better way
    // If not pagination is given, set it to unlimited
    if (!params.limit) params.limit = 1000000000;

    const toDeletePaginated = await this.getPaginated(params);
    const toDelete = toDeletePaginated.docs;

    let ids = [];
    toDelete.forEach((doc) => ids.push(doc.id));

    const deletionResult = await model.remove({ id: { $in: ids } });
    this.assert(deletionResult.result && deletionResult.result.ok === 1, new UncaughtError('unable to delete the items'));

    const wasToDeleteButStillHere = await model.find({ id: { $in: ids } });
    let deletedItems = toDelete.filter((toDeleteItem) => {
      let keepInDeletedList = true;
      wasToDeleteButStillHere.forEach((stillHere) => {
        if (toDeleteItem.id === stillHere.id) {
          keepInDeletedList = false;
        }
      });
      if (keepInDeletedList) {
        this.emit('deleted', toDeleteItem);
      }
      return keepInDeletedList;
    });
    return deletedItems;
  }

  /**
   * Delete a model by id
   *
   * @param {number} id - the id of the document
   * @return null - if document not found
   * @return {document} - the deleted document
   * @error {ValidationError} - if id is not valid
   */
  async deleteById(id) {
    this.assert(!isNaN(id), new ValidationError('id must be an integer', {
      property: 'id',
      type: 'format',
      message: 'must be an integer',
      name: 'ValidatorError', value: id,
    }));
    this.assert(id > 0, new ValidationError('id must be a positive integer', {
      property: 'id',
      type: 'format',
      message: 'id must be a positive integer',
      name: 'ValidatorError', value: id,
    }));

    // Query the ressource to remove
    const ressourceToDelete = await this.getById(id);
    this.assert(ressourceToDelete, new NotFoundError());

    // Remove
    let deleted = await this.delete({ id });
    this.assert(deleted && deleted.length === 1, new UncaughtError('Error while deleting the item'));
    return deleted[0];
  }

  /**
   * Get a paginated select from filter params
   *
   * @param {object} params - assoc key => value
   * @return {object} - paginated result
   * @error {ValidationError} - if id not good
   * @error {NotFoundError} - if item not found
   */
  async getPaginated(params) {
    const model = this.getModel();
    const query = this.getQuerableQuery(params);
    const options = this.getQuerableOptionsQuery(params);
    return await model.paginate(query.getQuery(), options);
  }

  isPropertyQuerable(property) {
    const model = this.getModel();
    const properties = model.getProperties();
    return properties[property] &&
      (
        properties[property].querable ||
        ['id', 'created_at', 'updated_at'].indexOf(property) > -1 // @todo: depend on model config
      );
  }

  getQuerableQuery(params) {
    const model = this.getModel();
    const query = model.find();
    const properties = model.getProperties();
    const me = this;
    Object.keys(params).forEach((field) => {
      let value = params[field];

      // Search type
      let searchType = 'equals';
      let searchMode = /^(\w+)__(\w+)$/.exec(field);
      if (searchMode) {
        field = searchMode[1];
        searchType = searchMode[2];
      }

      // Only querable properties
      if (me.isPropertyQuerable(field, this.modelName)) {
        if (properties[field].type === String) {
          value = `${value}`;
          switch (searchType) {
            case 'equals':
              query.where(field).equals(value);
              this.logger.verbose(`String "${field}" equals "${value}"`);
              break;
            case 'like':
              query.where(field).equals(new RegExp(`^.*${value}.*$`));
              this.logger.verbose(`String "${field}" like "${value}"`);
              break;
            case 'ilike':
              query.where(field).equals(new RegExp(`^.*${value}.*$`, 'i'));
              this.logger.verbose(`String "${field}" ilike "${value}"`);
              break;
            case 'in':
            case 'nin':
              query.where(field)[searchType](value.split(','));
              this.logger.verbose(`String "${field}" ${searchType} "${value.split(',')}"`);
              break;
            default:
          }
        } else if (properties[field].type === Number) {
          switch (searchType) {
            case 'equals':
            case 'gt':
            case 'gte':
            case 'lt':
            case 'lte':
              query.where(field)[searchType](Number(value));
              this.logger.verbose(`Number, "${field}" ${searchType} "${value}"`);
              break;
            case 'between': {
              const bounds = value.split(',');
              if (bounds.length !== 2) {
                throw new ValidationError('Between filter requires 2 values comma separated');
              }
              if (bounds[0]) {
                query.where(field).gte(Number(bounds[0]));
                this.logger.verbose(`Number "${field}" greater than "${bounds[0]}"`);
              }
              if (bounds[1]) {
                query.where(field).lte(Number(bounds[1]));
                this.logger.verbose(`Number "${field}" lower than "${bounds[1]}"`);
              }
              break;
            }
            case 'in':
            case 'nin':
              query.where(field)[searchType](value.split(','));
              this.logger.verbose(`Number "${field}" ${searchType} "${value.split(',')}"`);
              break;
            default:
          }
        } else if (properties[field].type === Date) {
          throw new Error('Date filter has not been implemented yet');
        }
      }
    });

    return query;
  }

  getQuerableOptionsQuery(params) {
    let options = {};

    options.page = parseInt(Number(params.page || this.paginationDefault.page), 10);
    options.limit = parseInt(Number(params.limit || this.paginationDefault.limit), 10);
    if (options.page < 1) options.page = this.paginationDefault.page;
    if (options.limit < 1) options.limit = this.paginationDefault.limit;

    if (params.order) {
      let orderOptions = [];
      let orderOptionsReq = params.order.split(',');
      orderOptionsReq.forEach((orderStr) => {
        let name = orderStr;
        let order = 'asc';
        if (name.substr(0, 1) === '-') {
          name = name.substr(1, name.length);
          order = 'desc';
        }
        if (this.isPropertyQuerable(name, this.modelName)) {
          orderOptions.push([name, order]);
        }
      });

      if (orderOptions.length > 0) {
        options.sort = orderOptions;
      }
    }

    return options;
  }
}
