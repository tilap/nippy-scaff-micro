import ModelService from '../../core/class/service-model';

module.exports = class PicturesService extends ModelService {
  constructor() {
    super({ defaultModelName: 'pictures' });
  }

  // Code sample from modelservice (exteding context service)
  // async doStuff(params) {
  //   this.getContextUser();
  //   this.setContextUser(user);
  //   this.getContextUser();
  //   this.hasContextUser();
  //   this.contextUserCan(rightId);
  //   this.getContextUserRights();
  //   this.assertHasContextUser(message = '');
  //   this.assertNoContextUser(message);
  //   this.assertContextUserCan(rightId, message = '');
  //   this.assertUserAndCan(rightId, message = '');
  //
  //   // emit an event
  //   // this.emit('something', anyData);
  //   return await super.createOne(params);
  // }


  // Below, existing methods to override

  // async createOne(params) {
  //   return await super.createOne(params);
  // }

  // async getById(id) {
  //   return await super.getById(id);
  // }

  // async update(params, newData) {
  //   return await super.update(params, newData);
  // }

  // async updateById(id, newData) {
  //   return await super.updateById(id, newData);
  // }

  // async delete(params) {
  //   return await super.delete(params);
  // }

  // async deleteById(id) {
  //   return await super.deleteById(id);
  // }

  // async getPaginated(params) {
  //   return await super.getPaginated(params);
  // }

  // isPropertyQuerable(property) {
  //   return super.isPropertyQuerable(property);
  // }

  // getQuerableQuery(params) {
  //   return super.getQuerableQuery(params);
  // }

  // getQuerableOptionsQuery(params) {
  //   return super.getQuerableOptionsQuery(params);
  // }
};
