// @flow
import EventEmitter from 'events';
import AppDispatcher from '../dispatchers/AppDispatcher';

export default class BaseStore extends EventEmitter {
  _dispatchToken: any;

  register(actionSubscribe: any) {
    this._dispatchToken = AppDispatcher.register(actionSubscribe);
  }

  get dispatchToken() {
    return this._dispatchToken;
  }

  emitChange() {
    this.emit('CHANGE');
  }

  addChangeListener(cb: any) {
    this.on('CHANGE', cb);
  }

  removeChangeListener(cb: any) {
    this.removeListener('CHANGE', cb);
  }
}
