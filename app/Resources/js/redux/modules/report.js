import REPORT_IDEA_SUCCESS from '../../constants/IdeaConstants';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import Fetcher from '../../services/Fetcher';

const OPEN_MODAL = 'report/OPEN_MODAL';
const CLOSE_MODAL = 'report/CLOSE_MODAL';
const START_LOADING = 'report/START_LOADING';
const STOP_LOADING = 'report/STOP_LOADING';

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

const submitReport = (url, data, dispatch, successMessage, successFluxAction = null) => {
  dispatch(startLoading());
  return new Promise((resolve, reject) => {
    Fetcher
      .post(url, data)
      .then(() => {
        dispatch(stopLoading());
        dispatch(closeModal());
        if (successFluxAction) {
          FluxDispatcher.dispatch({
            actionType: successFluxAction,
          });
        }
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
    'alert.success.report.idea',
    REPORT_IDEA_SUCCESS
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
    dispatch
  );
};

export const submitOpinionReport = (opinion, data, dispatch) => {
  return submitReport(
    `/${baseUrl(opinion)}/${opinion.id}/reports`,
    data,
    dispatch
  );
};

export const submitCommentReport = (comment, data, dispatch) => {
  return submitReport(
    `/comments/${comment.id}/reports`,
    data,
    dispatch
  );
};

export const submitProposalReport = (proposal, data, dispatch) => {
  return submitReport(
    `/proposals/${proposal.id}/reports`,
    data,
    dispatch
  );
};

export const reducer = (state = initialState, action) => {
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
