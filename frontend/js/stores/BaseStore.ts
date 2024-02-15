import EventEmitter from 'events'

export default class BaseStore extends EventEmitter {
  _dispatchToken: any

  register() {}

  emitChange() {
    this.emit('CHANGE')
  }

  addChangeListener(cb: any) {
    this.on('CHANGE', cb)
  }

  removeChangeListener(cb: any) {
    this.removeListener('CHANGE', cb)
  }
}
