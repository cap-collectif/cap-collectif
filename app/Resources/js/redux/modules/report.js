const OPEN_MODAL = 'report/OPEN_MODAL';
const CLOSE_MODAL = 'report/CLOSE_MODAL';
const START_LOADING = 'report/START_LOADING';
const STOP_LOADING = 'report/STOP_LOADING';

import FluxDispatcher from '../../dispatchers/AppDispatcher';
import Fetcher from '../../services/Fetcher';
const baseUrl = (opinion) => opinion.parent ? `opinions/${opinion.parent.id}/versions` : 'opinions';

const initialState = {
  showModal: false,
  isLoading: false,
};

export const openModal = () => {
  return {
    type: OPEN_MODAL,
  };
};

export const closeModal = () => {
  return {
    type: CLOSE_MODAL,
  };
};

const startLoading = () => {
  return {
    type: START_LOADING,
  };
};

const stopLoading = () => {
  return {
    type: STOP_LOADING,
  };
};

export const submitArgumentReport = (opinion, argument, data, dispatch) => {
  dispatch(startLoading());
  return new Promise((resolve, reject) => {
    Fetcher
      .post(`/${baseUrl(opinion)}/${opinion.id}/arguments/${argument}/reports`, data)
      .then(() => {
        dispatch(stopLoading());
        dispatch(closeModal());
        resolve();
      })
      .catch(() => {
        dispatch(stopLoading());
        reject({ _error: 'Failed to submit report!' });
      });
  });
};

// export const submitOpinionReport = (opinion, data) => {
//   return new Promise((resolve, reject) => {
//     Fetcher
//       .post(`/${baseUrl(opinion)}/${opinion.id}/reports`, data)
//       .then(() => {
//         FluxDispatcher.dispatch({
//           actionType: 'UPDATE_ALERT',
//           alert: { bsStyle: 'success', content: 'alert.success.report.opinion' },
//         });
//         resolve();
//       })
//       .catch(() => {
//         reject({ _error: 'Failed to submit report!' });
//       });
//   });
// };

export const reducer = (state = initialState, action) => {
  console.log(action);
  switch (action.type) {
    case START_LOADING:
      return Object.assign({}, state, { isLoading: true });
    case STOP_LOADING:
      return Object.assign({}, state, { isLoading: false });
    case OPEN_MODAL:
      return Object.assign({}, state, { showModal: true });
    case CLOSE_MODAL:
      return Object.assign({}, state, { showModal: false });
    default:
      return state;
  }
};
