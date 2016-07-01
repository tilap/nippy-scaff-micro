/**
 * micro-core v1.2.1 api client
 * Small api stack
 * generated on 1-7-2016 10h13
 */

const ApiClient = require('nippy-api-client').Client;

module.exports = class BaseClient extends ApiClient {

  /**
   * Create a new access token for a user based on its email/password
   * @param data
   */
  async createAccessToken(data = {}) {
    const response = await super.post('/accounts/accesstokens', {}, data);
    return response.getUniqueData();
  }

  /**
   * Create a new access token for a user based on its id
   * @param id
   */
  async createAccessTokenById(id) {
    const response = await super.post(`/accounts/accesstokens/${id}`);
    return response.getUniqueData();
  }

  /**
   * Get the current user based on the access token
   */
  async getCurrentUser() {
    const response = await super.get('/accounts/accesstokens');
    return response.getUniqueData();
  }

  /**
   * Register a new account
   * @param data
   */
  async registerAccount(data = {}) {
    const response = await super.post('/accounts/register/', {}, data);
    return response.getUniqueData();
  }

  /**
   * Validate an account with account data in url
   * @param options filtering items to get
   */
  async validateAccount(options = {}) {
    const response = await super.get('/accounts/register/', options);
    return response.getUniqueData();
  }

  /**
   * Request a new password email
   * @param data
   */
  async requestNewPassword(data = {}) {
    const response = await super.post('/accounts/password/', {}, data);
    return response.getData();
  }

  /**
   * Set a new password
   * @param data
   */
  async setAccountNewPassword(data = {}) {
    const response = await super.patch('/accounts/password/', {}, data);
    return response.getUniqueData();
  }

  /**
   * Get user from id with its recover password token
   * @param options filtering items to get
   */
  async getUserFromIdAndRecoverPasswordToken(options = {}) {
    const response = await super.get('/accounts/password/', options);
    return response.getUniqueData();
  }

  /**
   * Create a new user
   * @param data
   */
  async createUser(data = {}) {
    const response = await super.post('/users', {}, data);
    return response.getUniqueData();
  }

  /**
   * Get user list
   * @param options filtering items to get
   */
  async getUsers(options = {}) {
    const response = await super.get('/users', options);
    return response.getSuccess();
  }

  /**
   * Get a user ressource from its id
   * @param id
   */
  async getUserById(id) {
    const response = await super.get(`/users/${id}`);
    return response.getUniqueData();
  }

  /**
   * Update a list of user ressources
   * @param options filtering items to update
   * @param data
   */
  async updateUsers(options = {}, data = {}) {
    const response = await super.patch('/users', options, data);
    return response.getData();
  }

  /**
   * Update an existing user ressource
   * @param id
   * @param data
   */
  async updateUserById(id, data = {}) {
    const response = await super.patch(`/users/${id}`, {}, data);
    return response.getUniqueData();
  }

  /**
   * Delete many user ressources
   * @param options filtering items to delete
   */
  async deleteUsers(options = {}) {
    const response = await super.delete('/users', options);
    return response.getData();
  }

  /**
   * Delete a user by its id
   * @param id
   */
  async deleteUserById(id) {
    const response = await super.delete(`/users/${id}`);
    return response.getUniqueData();
  }

  /**
   * Give main api information such as version, name, author, documentation links...
   */
  async getDocumentationMain() {
    const response = await super.get('/documentation');
    return response.getUniqueData();
  }

  /**
   * Give api available errors code, name, description
   */
  async getDocumentationErrors() {
    const response = await super.get('/documentation/errors');
    return response.getData();
  }

  /**
   * Provide full api documentation
   */
  async getDocumentationMethods() {
    const response = await super.get('/documentation/methods');
    return response.getData();
  }

};
