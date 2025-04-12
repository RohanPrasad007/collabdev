export class Echo {
    constructor({
      echo_id = null,
      active_participants = [],
      status = 'pending',
      offer_details = '',
      answer_details = ''
    }) {
      this.echo_id = echo_id || `echo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.active_participants = active_participants;
      this.status = status;
      this.offer_details = offer_details;
      this.answer_details = answer_details;
    }
  }
  