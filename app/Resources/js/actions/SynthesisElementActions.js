import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {RECEIVE_COUNT, RECEIVE_ELEMENTS, RECEIVE_ELEMENT, ARCHIVE_ELEMENT, UPDATE_ELEMENT, NOTE_ELEMENT, DISABLE_ELEMENT, MOVE_ELEMENT, UPDATE_ELEMENT_SUCCESS, UPDATE_ELEMENT_FAILURE} from '../constants/SynthesisElementConstants';

const updateElementFromData = (synthesis, element, data) => {
  return Fetcher
    .put('/syntheses/' + synthesis + '/elements/' + element, data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ELEMENT_SUCCESS,
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ELEMENT_FAILURE,
        error: 'common.errors.update_error',
      });
      return false;
    });
};

export default {

  archive: (synthesis, element, data) => {
    AppDispatcher.dispatch({
      actionType: ARCHIVE_ELEMENT,
      archived: data.archived,
    });
    updateElementFromData(synthesis, element, data);
  },

  note: (synthesis, element, data) => {
    AppDispatcher.dispatch({
      actionType: NOTE_ELEMENT,
      notation: data.notation,
    });
    updateElementFromData(synthesis, element, data);
  },

  disable: (synthesis, element, data) => {
    AppDispatcher.dispatch({
      actionType: DISABLE_ELEMENT,
      enabled: data.enabled,
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
          elements: data,
        });
        return true;
      });
  },

  loadElementsCountFromServer: (synthesis, type) => {
    Fetcher
      .get('/syntheses/' + synthesis + '/elements/count?type=' + type)
      .then((data) => {
        data.actionType = RECEIVE_COUNT;
        AppDispatcher.dispatch(data);
        return true;
      });
  },

};
