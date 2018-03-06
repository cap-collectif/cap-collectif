import BaseStore from './BaseStore';

class MessageStore extends BaseStore {
  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._messages = {
      errors: [],
      success: []
    };
  }

  _registerToActions(action) {
    switch (action.actionType) {
      default:
        break;
    }
  }

  get messages() {
    return this._messages;
  }

  _resetMessages() {
    this._messages.errors = [];
    this._messages.success = [];
  }
}

export default new MessageStore();
