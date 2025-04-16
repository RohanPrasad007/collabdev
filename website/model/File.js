export class File {
    constructor({
      file_id = null,
      file_url,
      upload_time = null,
      delete_after = null
    }) {
      this.file_id = file_id || `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.file_url = file_url;
      this.upload_time = upload_time || new Date().toISOString();
      this.delete_after = delete_after;
    }
  }