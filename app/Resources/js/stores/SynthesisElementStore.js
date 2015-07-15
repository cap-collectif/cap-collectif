import {RECEIVE_COUNT, RECEIVE_ELEMENTS, RECEIVE_ELEMENT, ARCHIVE_ELEMENT, NOTE_ELEMENT, DISABLE_ELEMENT, MOVE_ELEMENT, UPDATE_ELEMENT_SUCCESS, UPDATE_ELEMENT_FAILURE} from '../constants/SynthesisElementConstants';
import BaseStore from './BaseStore';

class SynthesisElementStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._element = null;
    this._elements = [];
    this._count = 0;
    this._isSync = true;
    this._errors = [];
  }

  _registerToActions(action) {
    switch (action.actionType) {
      case RECEIVE_COUNT:
        this._count = action.count;
        this._isSync = true;
        this.emitChange();
        break;
      case RECEIVE_ELEMENT:
        this._element = action.element;
        this._isSync = true;
        this.emitChange();
        break;
      case RECEIVE_ELEMENTS:
        this._elements = action.elements;
        this._isSync = true;
        this.emitChange();
        break;
      case ARCHIVE_ELEMENT:
        this._element.archived = action.archived;
        this._errors = [];
        this.emitChange();
        break;
      case NOTE_ELEMENT:
        this._element.notation = action.notation;
        this._errors = [];
        this.emitChange();
        break;
      case DISABLE_ELEMENT:
        this._element.enabled = action.enabled;
        this._errors = [];
        this.emitChange();
        break;
      case MOVE_ELEMENT:
        this._element.parent = action.parent;
        this._errors = [];
        this.emitChange();
        break;
      case UPDATE_ELEMENT_SUCCESS:
        this._isSync = false;
        this._errors = [];
        this.emitChange();
        break;
      case UPDATE_ELEMENT_FAILURE:
        this._errors.push(action.error);
        this._isSync = false;
        this.emitChange();
        break;
      default: break;
    }
  }

  get isSync() {
    return this._isSync;
  }

  get element() {
    return this._element;
  }

  get elements() {
    return this._elements;
  }

  get count() {
    return this._count;
  }

  get errors() {
    return this._errors;
  }

}

export default new SynthesisElementStore();
