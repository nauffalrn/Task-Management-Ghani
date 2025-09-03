export class BaseService {
  constructor(repository, entityName = "record") {
    this.repository = repository;
    this.entityName = entityName;
  }

  async getById(id) {
    if (!id) {
      throw new Error(`${this.entityName} ID is required`);
    }
    return await this.repository.findById(id);
  }

  async getAll(options = {}) {
    return await this.repository.findAll(options);
  }

  async create(data) {
    if (!data) {
      throw new Error(`${this.entityName} data is required`);
    }
    return await this.repository.create(data);
  }

  async update(id, data) {
    if (!id || !data) {
      throw new Error(`${this.entityName} ID and data are required`);
    }
    return await this.repository.update(id, data);
  }

  async delete(id) {
    if (!id) {
      throw new Error(`${this.entityName} ID is required`);
    }
    return await this.repository.delete(id);
  }

  async validateExists(id) {
    const record = await this.getById(id);
    if (!record) {
      const error = new Error(`${this.entityName} not found`);
      error.statusCode = 404;
      throw error;
    }
    return record;
  }
}