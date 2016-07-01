/*
 * Basic controller bound to a service with crud
 */
import { Controller, KoaContextHelper } from 'nippy-core-lib';
import { NotFoundError, ValidationError } from '../errors';

module.exports = class ControllerService extends Controller {
  constructor({ defaultServiceId = null, logger = console } = {}) {
    super({ logger });
    this.defaultServiceId = defaultServiceId;
  }

  async get(ctx, next) {
    const h = new KoaContextHelper(ctx);

    const queryArgs = h.getQueries();
    const service = ctx.getService(this.defaultServiceId);
    const results = await service.getPaginated(queryArgs);
    ctx.setFromPaginateResult(results);

    if (next) await next();
  }

  async getById(ctx, next) {
    const h = new KoaContextHelper(ctx);
    const service = ctx.getService(this.defaultServiceId);

    const id = h.getParam('id', null);
    const item = await service.getById(id);
    if (!item) {
      ctx.throw(new NotFoundError('Item not found'));
    } else {
      ctx.apiResponse.setData(item);
    }

    if (next) await next();
  }

  // @warning: data post are not filtered
  async createOne(ctx, next) {
    const service = ctx.getService(this.defaultServiceId);
    const h = new KoaContextHelper(ctx);

    const itemData = h.getRequestBodies();
    const insertedItem = await service.createOne(itemData);
    ctx.apiResponse.setData(insertedItem);

    if (next) await next();
  }

  async updateById(ctx, next) {
    const service = ctx.getService(this.defaultServiceId);
    const h = new KoaContextHelper(ctx);

    let changedItem = null;
    const id = h.getParam('id', null);
    const itemData = h.getRequestBodies();

    changedItem = await service.updateById(id, itemData);
    if (!changedItem.document) {
      ctx.throw(new NotFoundError('Item not found'));
    }
    if (changedItem.error) {
      if (changedItem.error.name === 'ValidationError') {
        ctx.apiResponse.setErrorDetails(changedItem.error.errors);
        throw new ValidationError('item validation error');
      }
      // Other error
      ctx.apiResponse.setErrorDetails(changedItem.error);
      ctx.throw(changedItem.error);
    }
    ctx.apiResponse.setData(changedItem);

    if (next) await next();
  }

  async update(ctx, next) {
    const service = ctx.getService(this.defaultServiceId);
    const h = new KoaContextHelper(ctx);

    const queryArgs = h.getQueries();
    const updateData = h.getRequestBodies();

    if (Object.keys(updateData).length === 0) {
      ctx.throw(new ValidationError('No data to update provided'));
    }

    const updateResult = await service.update(queryArgs, updateData);
    ctx.apiResponse.setData(updateResult);

    if (next) await next();
  }

  async delete(ctx, next) {
    const service = ctx.getService(this.defaultServiceId);
    const h = new KoaContextHelper(ctx);

    const queryArgs = h.getQueries();
    const deletedItems = await service.delete(queryArgs);
    ctx.apiResponse.setData({ deleted: deletedItems });

    if (next) await next();
  }

  async deleteById(ctx, next) {
    const service = ctx.getService(this.defaultServiceId);
    const h = new KoaContextHelper(ctx);

    const id = h.getParam('id', 0);
    const deletedItems = await service.deleteById(id);
    ctx.apiResponse.addData(deletedItems);
    if (next) await next();
  }
};
