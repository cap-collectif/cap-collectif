import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {RECEIVE_COUNT, RECEIVE_ELEMENTS, RECEIVE_ELEMENT, ARCHIVE_ELEMENT, UPDATE_ELEMENT, NOTE_ELEMENT, MOVE_ELEMENT, UPDATE_ELEMENT_SUCCESS, UPDATE_ELEMENT_FAILURE} from '../constants/SynthesisElementConstants';

const updateElementFromData = (synthesis, element, data, successMessage = 'common.success.update_success', errorMessage = 'common.errors.update_error') => {
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
    updateElementFromData(synthesis, element, data, 'common.success.archive_success', 'common.errors.archive_error');
  },

  note: (synthesis, element, data) => {
    AppDispatcher.dispatch({
      actionType: NOTE_ELEMENT,
      notation: data.notation,
    });
    updateElementFromData(synthesis, element, data);
  },

  move: (synthesis, element, data) => {
    AppDispatcher.dispatch({
      actionType: MOVE_ELEMENT,
      parent: data.parent,
    });
    updateElementFromData(synthesis, element, data);
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

  loadElementsTreeFromServer: (synthesis) => {
    Fetcher
      .get('/syntheses/' + synthesis + '/elements/tree')
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_ELEMENTS,
          type: 'tree',
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
