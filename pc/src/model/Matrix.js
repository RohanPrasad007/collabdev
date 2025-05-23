export class Matrix {
  constructor({
    matrix_id = null,
    name,
    logo,
    echoes = [],
    threads = [],
    users = [],
    permissions = {}
  }) {
    this.matrix_id = matrix_id || `matrix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.logo = logo;
    this.echoes = echoes;
    this.threads = threads;
    this.users = users;
    this.permissions = permissions;
  }
}