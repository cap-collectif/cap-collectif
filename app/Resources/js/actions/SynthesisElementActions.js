import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import * as Actions from '../constants/SynthesisElementActionsConstants';
import { DISMISS_MESSAGE } from '../constants/MessageConstants';

const idOf = val => {
  if (val === 'root') {
    return null;
  }
  if (val !== null && typeof val === 'object') {
    if (val.id === 'root') {
      return null;
    }
    return val.id;
  }
  return val;
};

const updateElementFromData = (
  synthesis,
  element,
  data,
  successMessage = 'synthesis.common.success.update_success',
  errorMessage = 'synthesis.common.errors.update_error',
) =>
  Fetcher.put(`/syntheses/${synthesis}/elements/${element}`, data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: Actions.UPDATE_ELEMENT_SUCCESS,
        message: successMessage,
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: Actions.UPDATE_ELEMENT_FAILURE,
        message: errorMessage,
      });
      return false;
    });

const createElementFromData = (
  synthesis,
  data,
  successMessage = 'synthesis.common.success.update_success',
  errorMessage = 'synthesis.common.errors.update_error',
) =>
  Fetcher.post(`/syntheses/${synthesis}/elements`, data)
    .then(response => {
      response.json().then(element => {
        AppDispatcher.dispatch({
          actionType: Actions.CREATE_ELEMENT_SUCCESS,
          element,
          message: successMessage,
        });
        return true;
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: Actions.CREATE_ELEMENT_FAILURE,
        message: errorMessage,
      });
      return false;
    });

const fetchElementById = (synthesis, element) =>
  Fetcher.get(`/syntheses/${synthesis}/elements/${element}`).then(data => {
    AppDispatcher.dispatch({
      actionType: Actions.RECEIVE_ELEMENT,
      elementId: element,
    });

    AppDispatcher.dispatch({
      actionType: Actions.RECEIVE_ELEMENT_SUCCESS,
      element: data,
    });
    return true;
  });

export default {
  create: (synthesis, data) => {
    AppDispatcher.dispatch({
      actionType: Actions.CREATE_ELEMENT,
      element: data,
    });
    if (data.parent) {
      data.parent = idOf(data.parent);
    }
    createElementFromData(
      synthesis,
      data,
      'synthesis.common.success.create_success',
      'synthesis.common.errors.create_error',
    );
  },

  loadElementFromServer: (synthesis, element) => {
    fetchElementById(synthesis, element);
  },

  loadElementsFromServer: (synthesis, type, offset, limit) => {
    Fetcher.get(
      `/syntheses/${synthesis}/elements?type=${type}&offset=${offset}&limit=${limit}`,
    ).then(data => {
      data.actionType = Actions.RECEIVE_ELEMENTS_SUCCESS;
      data.type = type;
      AppDispatcher.dispatch(data);
      return true;
    });
  },

  loadElementsByTermFromServer: (synthesis, term, offset, limit, type = 'all') => {
    Fetcher.get(
      `/syntheses/${synthesis}/elements?term=${term}&type=${type}&offset=${offset}&limit=${limit}`,
    ).then(data => {
      data.actionType = Actions.RECEIVE_ELEMENTS_SUCCESS;
      data.type = 'search';
      AppDispatcher.dispatch(data);
      return true;
    });
  },

  loadElementsTreeFromServer: (synthesis, type, parent = null, depth = null) => {
    let url = `/syntheses/${synthesis}/elements/tree?type=${type}`;
    url += parent ? `&parent=${parent}` : '';
    url += depth ? `&depth=${depth}` : '';
    Fetcher.get(url)
      .then(data => {
        AppDispatcher.dispatch({
          actionType: Actions.RECEIVE_ELEMENTS_SUCCESS,
          type: `${type}Tree`,
          elements: data,
          parent,
        });
        return true;
      })
      .catch(() => false);
  },

  loadElementsCountFromServer: (synthesis, type) => {
    Fetcher.get(`/syntheses/${synthesis}/elements/count?type=${type}`).then(data => {
      AppDispatcher.dispatch({
        actionType: Actions.RECEIVE_COUNT,
        type,
        count: data.count,
      });
      return true;
    });
  },

  update: (synthesis, element, data) => {
    if (data.archived || data.published) {
      AppDispatcher.dispatch({
        actionType: Actions.ARCHIVE_ELEMENT,
        archived: data.archived,
        published: data.published,
        elementId: element,
      });
    }
    if (data.parent) {
      AppDispatcher.dispatch({
        actionType: Actions.MOVE_ELEMENT,
        parent: data.parent,
        elementId: element,
      });
      data.parent = idOf(data.parent);
    }
    if (data.notation) {
      AppDispatcher.dispatch({
        actionType: Actions.NOTE_ELEMENT,
        notation: data.notation,
        elementId: element,
      });
    }
    if (data.title) {
      AppDispatcher.dispatch({
        actionType: Actions.NAME_ELEMENT,
        title: data.title,
        elementId: element,
      });
    }
    if (data.description) {
      AppDispatcher.dispatch({
        actionType: Actions.DESCRIBE_ELEMENT,
        description: data.description,
        elementId: element,
      });
    }
    if (data.comment) {
      AppDispatcher.dispatch({
        actionType: Actions.COMMENT_ELEMENT,
        comment: data.comment,
        elementId: element,
      });
    }
    if (data.division) {
      data.division.elements.forEach((el, index) => {
        data.division.elements[index].parent = idOf(el.parent);
      });
      AppDispatcher.dispatch({
        actionType: Actions.DIVIDE_ELEMENT,
        division: data.division,
        elementId: element,
      });
    }
    updateElementFromData(
      synthesis,
      element,
      data,
      'synthesis.common.success.archive_success',
      'synthesis.common.errors.archive_error',
    );
  },

  expandTreeItem(type, elementId, expanded) {
    AppDispatcher.dispatch({
      actionType: Actions.EXPAND_TREE_ITEM,
      elementId,
      expanded,
      type,
    });
  },

  selectNavItem(elementId) {
    AppDispatcher.dispatch({
      actionType: Actions.SELECT_NAV_ITEM,
      elementId,
    });
  },

  dismissMessage(message, type) {
    AppDispatcher.dispatch({
      actionType: DISMISS_MESSAGE,
      message,
      type,
    });
  },
};
