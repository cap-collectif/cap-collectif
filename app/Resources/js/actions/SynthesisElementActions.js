import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {RECEIVE_COUNT, RECEIVE_ELEMENTS, RECEIVE_ELEMENT, ARCHIVE_ELEMENT, UPDATE_ELEMENT, NOTE_ELEMENT, MOVE_ELEMENT, UPDATE_ELEMENT_SUCCESS, UPDATE_ELEMENT_FAILURE} from '../constants/SynthesisElementConstants';

const updateElementFromData = (synthesis, element, data, successMessage = 'common.success.update_success', errorMessage = 'common.errors.update_error') => {
  if (typeof data.parent === 'object') {
    data.parent = data.parent.id;
  }
  if (data.parent === 'root') {
    data.parent = null;
  }
  return Fetcher
    .put('/syntheses/' + synthesis + '/elements/' + element, data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ELEMENT_SUCCESS,
        message: successMessage,
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ELEMENT_FAILURE,
        message: errorMessage,
      });
      return false;
    });
};

export default {

  archive: (synthesis, element, data) => {
    AppDispatcher.dispatch({
      actionType: ARCHIVE_ELEMENT,
      archived: data.archived,
      published: data.published,
    });
    if (data.parent) {
      AppDispatcher.dispatch({
        actionType: MOVE_ELEMENT,
        parent: data.parent,
      });
    }
    if (data.notation) {
      AppDispatcher.dispatch({
        actionType: NOTE_ELEMENT,
        notation: data.notation,
      });
    }
    updateElementFromData(synthesis, element, data, 'common.success.archive_success', 'common.errors.archive_error');
  },

  update: (synthesis, element, data) => {
    AppDispatcher.dispatch({
      actionType: UPDATE_ELEMENT,
    });
    updateElementFromData(synthesis, element, data);
  },

  loadElementFromServer: (synthesis, element) => {
    Fetcher
      .get('/syntheses/' + synthesis + '/elements/' + element)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_ELEMENT,
          element: data,
        });
        return true;
      });
  },

  loadElementsFromServer: (synthesis, type) => {
    Fetcher
      .get('/syntheses/' + synthesis + '/elements?type=' + type)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_ELEMENTS,
          type: type,
          elements: data,
        });
        return true;
      });
  },

  loadElementsTreeFromServer: (synthesis, type) => {
    Fetcher
      .get('/syntheses/' + synthesis + '/elements/tree?type=' + type)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_ELEMENTS,
          type: type + 'Tree',
          elements: data,
        });
        return true;
      });
  },

  loadElementsCountFromServer: (synthesis, type) => {
    Fetcher
      .get('/syntheses/' + synthesis + '/elements/count?type=' + type)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_COUNT,
          type: type,
          count: data.count,
        });
        return true;
      });
  },

};
