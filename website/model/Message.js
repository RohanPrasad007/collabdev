export class Message {
    constructor({
      user_id,
      content,
      date_time = null
    }) {
      this.user_id = user_id;
      this.content = content;
      this.date_time = date_time || new Date().toISOString();
    }
  }