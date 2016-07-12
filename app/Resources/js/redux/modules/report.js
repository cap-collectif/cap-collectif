import { UPDATE_ALERT } from '../../constants/AlertConstants';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import Fetcher from '../../services/Fetcher';

export const OPEN_MODAL = 'report/OPEN_MODAL';
export const CLOSE_MODAL = 'report/CLOSE_MODAL';
export const START_LOADING = 'report/START_LOADING';
export const STOP_LOADING = 'report/STOP_LOADING';
export const ADD_REPORTED = 'report/ADD_REPORTED';

const baseUrl = (opinion) => opinion.parent ? `opinions/${opinion.parent.id}/versions` : 'opinions';

const initialState = {
  currentReportingModal: null,
  isLoading: false,
  elements: [],
};

export const openModal = (id) => {
  return {
    type: OPEN_MODAL,
    payload: { id },
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

const addReported = () => {
  return {
    type: ADD_REPORTED,
  };
};

const submitReport = (url, data, dispatch, successMessage) => {
  dispatch(startLoading());
  return new Promise((resolve, reject) => {
    Fetcher
      .post(url, data)
      .then(() => {
        dispatch(addReported());
        dispatch(stopLoading());
        dispatch(closeModal());
        FluxDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: successMessage },
        });
        resolve();
      })
      .catch(() => {
        dispatch(stopLoading());
        reject({ _error: 'Failed to submit report!' });
      });
  });
};

export const submitIdeaReport = (idea, data, dispatch) => {
  return submitReport(
    `/ideas/${idea}/reports`,
    data,
    dispatch,
    'alert.success.report.idea'
  );
};

export const submitSourceReport = (opinion, sourceId, data, dispatch) => {
  return submitReport(
    `/${baseUrl(opinion)}/${opinion.id}/sources/${sourceId}/reports`,
    data,
    dispatch,
    'alert.success.report.source'
  );
};

export const submitArgumentReport = (opinion, argument, data, dispatch) => {
  return submitReport(
    `/${baseUrl(opinion)}/${opinion.id}/arguments/${argument}/reports`,
    data,
    dispatch,
    'alert.success.report.argument'
  );
};

export const submitOpinionReport = (opinion, data, dispatch) => {
  return submitReport(
    `/${baseUrl(opinion)}/${opinion.id}/reports`,
    data,
    dispatch,
    'alert.success.report.opinion'
  );
};

export const submitCommentReport = (comment, data, dispatch) => {
  return submitReport(
    `/comments/${comment.id}/reports`,
    data,
    dispatch,
    'alert.success.report.comment'
  );
};

export const submitProposalReport = (proposal, data, dispatch) => {
  return submitReport(
    `/proposals/${proposal.id}/reports`,
    data,
    dispatch,
    'alert.success.report.proposal'
  );
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case START_LOADING:
      return Object.assign({}, state, { isLoading: true });
    case STOP_LOADING:
      return Object.assign({}, state, { isLoading: false });
    case OPEN_MODAL:
      return Object.assign({}, state, { currentReportingModal: action.payload.id });
    case CLOSE_MODAL:
      return Object.assign({}, state, { currentReportingModal: null });
    case ADD_REPORTED: {
      return { ...state, elements: [...state.elements, state.currentReportingModal] };
    }
    default:
      return state;
  }
};
