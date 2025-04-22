// model/Thread.js
export class Thread {
  constructor({
    thread_id = null,
    name = '',
    access_level = 'All',
    messages = [],
    files = [],
    created_at = new Date().toISOString(),
    created_by = null
  }) {
    this.thread_id = thread_id || `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.access_level = access_level;
    this.messages = messages;
    this.files = files;
    this.created_at = created_at;
    this.created_by = created_by;
  }
}