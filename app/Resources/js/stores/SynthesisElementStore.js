import * as Actions from '../constants/SynthesisElementActionsConstants';
import BaseStore from './BaseStore';
import {DISMISS_MESSAGE} from '../constants/MessageConstants';
import ArrayHelper from '../services/ArrayHelper';

class SynthesisElementStore extends BaseStore {

  constructor() {
    super();
    this.register(this._registerToActions.bind(this));
    this._element = null;
    this._currentId = null;
    this._elements = {
      'new': [],
      'archived': [],
      'published': [],
      'unpublished': [],
      'all': [],
      'publishedTree': [],
      'notIgnoredTree': [],
      'fromDivision': [],
      'search': [],
    };
    this._counts = {
      'new': 0,
      'archived': 0,
      'published': 0,
      'unpublished': 0,
      'all': 0,
      'publishedTree': 0,
      'notIgnoredTree': 0,
      'fromDivision': 0,
      'search': 0,
    };
    this._expandedItems = {
      'nav': {
        root: true,
      },
      'view': {
        root: true,
      },
    };
    this._selectedNavItem = 'root';
    this._isProcessing = false;
    this._isFetchingTree = false;
    this._isElementSync = false;
    this._isCountSync = false;
    this._isInboxSync = {
      'new': false,
      'archived': false,
      'published': false,
      'unpublished': false,
      'all': false,
      'publishedTree': false,
      'notIgnoredTree': false,
      'fromDivision': false,
      'search': false,
    };
    this._messages = {
      errors: [],
      success: [],
    };
  }

  _registerToActions(action) {
    let element = null;
    switch (action.actionType) {
    case Actions.RECEIVE_COUNT:
      this._counts[action.type] = action.count;
      this._isCountSync = true;
      this.emitChange();
      break;
    case Actions.RECEIVE_ELEMENT:
      this._currentId = action.elementId;
      this._isElementSync = false;
      this._isProcessing = true;
      this.updateSelectedId(action.elementId);
      this.emitChange();
      break;
    case Actions.RECEIVE_ELEMENT_SUCCESS:
      if (action.element.id === this._currentId) {
        this._element = action.element;
        this._isElementSync = true;
        this._isProcessing = false;
        this.emitChange();
      }
      break;
    case Actions.RECEIVE_ELEMENT_FAILURE:
      this._isProcessing = false;
      break;
    case Actions.RECEIVE_ELEMENTS:
      this._isFetchingTree = true;
      this._isInboxSync[action.type] = false;
      this.emitChange();
      break;
    case Actions.RECEIVE_ELEMENTS_SUCCESS:
      if (!action.parent) {
        this._elements[action.type] = action.elements;
      } else {
        this.updateTreeByTypeWithChildren(action.type, action.parent, action.elements);
      }
      this._counts[action.type] = action.count;
      this._isInboxSync[action.type] = true;
      this._isFetchingTree = false;
      this.emitChange();
      break;
    case Actions.RECEIVE_ELEMENTS_FAILURE:
      this._isFetchingTree = false;
      this.emitChange();
      break;
    case Actions.EXPAND_TREE_ITEM:
      this._expandedItems[action.type][action.elementId] = action.expanded;
      this.emitChange();
      break;
    case Actions.SELECT_NAV_ITEM:
      this.updateSelectedId(action.elementId);
      this.emitChange();
      break;
    case Actions.CREATE_ELEMENT:
      this._resetInboxSync();
      this._isProcessing = true;
      this._resetMessages();
      this.emitChange();
      break;
    case Actions.ARCHIVE_ELEMENT:
      this._resetMessages();
      element = this._element && action.elementId === this._element.id
        ? this._element
        : this.getElementInTreeById(this._elements.notIgnoredTree, action.elementId)
      ;
      // Update data
      // If we ignored an element, lists are not synced anymore
      if (action.published && element) {
        this._elements.new = ArrayHelper.removeElementFromArray(this._elements.new, element);
        this._counts.new = this._elements.new.length;
        this.elements.archived = ArrayHelper.addElementToArray(this._elements.archived, element);
        this._elements.published = ArrayHelper.addElementToArray(this._elements.published, element);
        this._elements.unpublished = ArrayHelper.removeElementFromArray(this._elements.unpublished, element);
      } else {
        if (element) {
          this.removeElementFromTree(element);
        }
        this._isProcessing = true;
        this._resetInboxSync();
      }
      if (this._element && action.elementId === this._element.id) {
        // Apply changes to element
        this._element.archived = action.archived;
        this._element.published = action.published;
      }
      this.emitChange();
      break;
    case Actions.NOTE_ELEMENT:
      this._element.notation = action.notation;
      this._resetInboxSync();
      this._isProcessing = true;
      this._resetMessages();
      this.emitChange();
      break;
    case Actions.COMMENT_ELEMENT:
      this._element.comment = action.comment;
      this._resetInboxSync();
      this._isProcessing = true;
      this._resetMessages();
      this.emitChange();
      break;
    case Actions.DESCRIBE_ELEMENT:
      element = this._element && action.elementId === this._element.id
        ? this._element
        : this.getElementInTreeById(this._elements.notIgnoredTree, action.elementId)
      ;
      if (element) {
        element.description = action.description;
      }
      this._resetInboxSync();
      this._isProcessing = true;
      this._resetMessages();
      this.emitChange();
      break;
    case Actions.NAME_ELEMENT:
      element = this._element && action.elementId === this._element.id
        ? this._element
        : this.getElementInTreeById(this._elements.notIgnoredTree, action.elementId)
      ;
      if (element) {
        element.title = action.title;
      }
      this._resetInboxSync();
      this._isProcessing = true;
      this._resetMessages();
      this.emitChange();
      break;
    case Actions.MOVE_ELEMENT:
      const parentId = typeof action.parent === 'object' ? action.parent.id : action.parent;
      this.changeElementParent(parentId, action.elementId);
      this._resetInboxSync();
      this._isProcessing = true;
      this._resetMessages();
      this.emitChange();
      break;
    case Actions.DIVIDE_ELEMENT:
      this._element.division = action.division;
      action.division.elements.map((newElement) => {
        this.addElementInTree(newElement);
      });
      element = this._element && action.elementId === this._element.id
        ? this._element
        : this.getElementInTreeById(this._elements.notIgnoredTree, action.elementId)
      ;
      if (element) {
        this.removeElementFromTree(element);
      }
      this._resetInboxSync();
      this._isProcessing = true;
      this._resetMessages();
      this.emitChange();
      break;
    case Actions.UPDATE_ELEMENT_SUCCESS:
      this._resetMessages();
      this._messages.success.push(action.message);
      this._isProcessing = false;
      this.emitChange();
      break;
    case Actions.UPDATE_ELEMENT_FAILURE:
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this._isProcessing = false;
      this._isElementSync = false;
      this._resetInboxSync();
      this.emitChange();
      break;
    case Actions.CREATE_ELEMENT_SUCCESS:
      this._resetMessages();
      this._messages.success.push(action.message);
      this.addElementInTree(action.element);
      this._isProcessing = false;
      this.emitChange();
      break;
    case Actions.CREATE_ELEMENT_FAILURE:
      this._messages.errors.push(action.message);
      this._messages.success = [];
      this._isProcessing = false;
      this._isElementSync = false;
      this._resetInboxSync();
      this.emitChange();
      break;
    case DISMISS_MESSAGE:
      this._messages[action.type] = this._messages[action.type].filter((message) => {
        return message !== action.message;
      });
      this.emitChange();
      break;
    default: break;
    }
  }

  get isProcessing() {
    return this._isProcessing;
  }

  get isFetchingTree() {
    return this._isFetchingTree;
  }

  get isElementSync() {
    return this._isElementSync;
  }

  get isCountSync() {
    return this._isCountSync;
  }

  get isInboxSync() {
    return this._isInboxSync;
  }

  get element() {
    return this._element;
  }

  get elements() {
    return this._elements;
  }

  get expandedItems() {
    return this._expandedItems;
  }

  get selectedNavItem() {
    return this._selectedNavItem;
  }

  get counts() {
    return this._counts;
  }

  get messages() {
    return this._messages;
  }

  _resetMessages() {
    this._messages.errors = [];
    this._messages.success = [];
  }

  _resetInboxSync() {
    this._isInboxSync.new = false;
    this._isInboxSync.archived = false;
    this._isInboxSync.published = false;
    this._isInboxSync.unpublished = false;
    this._isInboxSync.fromDivision = false;
    this._isCountSync = false;
  }

  updateSelectedId(selected = this._selectedNavbarItem) {
    this._selectedNavbarItem = selected;
    const expanded = this._expandedItems.nav;
    expanded[selected] = true;
    const element = this.getElementInTreeById(this._elements.notIgnoredTree, selected);
    if (element) {
      this.getParentItems(element).map((parent) => {
        expanded[parent.id] = true;
      });
    }
    this._expandedItems.nav = expanded;
  }

  changeElementParent(parentId, elementId) {
    const element = this._element && elementId === this._element.id
      ? this._element
      : this.getElementInTreeById(this._elements.notIgnoredTree, elementId)
    ;
    const prevParentId = element.parent ? element.parent.id : this.getDirectParentId(element);
    let tree = this._elements.notIgnoredTree;
    // Remove element from previous parent in tree
    if (!prevParentId) {
      tree = ArrayHelper.removeElementFromArray(tree, element);
    } else {
      const prevParent = this.getElementInTreeById(tree, prevParentId);
      if (prevParent) {
        const prevChildren = prevParent.children;
        prevParent.children = ArrayHelper.removeElementFromArray(prevChildren, element);
        prevParent.childrenCount = prevParent.children.length;
      }
    }
    // Add element to parent in tree
    const parentInTree = this.getElementInTreeById(tree, parentId);
    if (parentId === 'root') {
      tree = ArrayHelper.addElementToArray(tree, element);
    } else if (parentInTree) {
      const children = parentInTree.children;
      parentInTree.children = ArrayHelper.addElementToArray(children, element);
      parentInTree.childrenCount = parentInTree.children.length;
    }
    element.parent = parent;
  }

  getElementInTreeById(tree, id) {
    for (let i = 0; i < tree.length; i++) {
      const element = tree[i];
      if (element.id === id) {
        return element;
      }
      if (element.children && element.children.length > 0) {
        const found = this.getElementInTreeById(element.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  getParentItems(element) {
    const items = [];
    element.path.split('|').map((data) => {
      const splitted = data.split('-');
      const title = splitted.slice(0, splitted.length - 5).join('-');
      const id = splitted.slice(splitted.length - 5, splitted.length).join('-');
      const item = {
        'title': title || null,
        'id': id,
      };
      items.push(item);
    });
    return items;
  }

  getDirectParentItem(element) {
    const parents = this.getParentItems(element);
    if (parents.length < 2) {
      return null;
    }
    return parents[parents.length - 2];
  }

  getDirectParentId(element) {
    const parent = this.getDirectParentItem(element);
    return parent ? parent.id : null;
  }

  updateTreeByTypeWithChildren(type, parentId, children) {
    const tree = this._elements[type];
    const parent = this.getElementInTreeById(tree, parentId);
    if (parent) {
      parent.children = children;
      parent.childrenCount = children.length;
    }
  }

  addElementInTree(child) {
    let tree = this._elements.notIgnoredTree;
    const parent = child.parent;
    if (!parent) {
      tree = ArrayHelper.addElementToArray(tree, child);
    } else {
      const parentInTree = this.getElementInTreeById(tree, parent.id);
      if (parentInTree) {
        let children = parentInTree.children;
        children = ArrayHelper.addElementToArray(children, child);
        parentInTree.children = children;
        parentInTree.childrenCount++;
      }
    }
  }

  removeElementFromTree(child) {
    let tree = this._elements.notIgnoredTree;
    const parent = child.parent;
    if (!parent) {
      tree = ArrayHelper.removeElementFromArray(tree, child);
    } else {
      const parentInTree = this.getElementInTreeById(tree, parent.id);
      if (parentInTree) {
        let children = parentInTree.children;
        children = ArrayHelper.removeElementFromArray(children, child);
        parentInTree.children = children;
        parentInTree.childrenCount++;
      }
    }
  }

}

export default new SynthesisElementStore();
