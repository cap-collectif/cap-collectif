import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {
  RECEIVE_PROPOSALS,

  CREATE_PROPOSAL_VOTE,
  CREATE_PROPOSAL_VOTE_SUCCESS,
  CREATE_PROPOSAL_VOTE_FAILURE,

  DELETE_PROPOSAL_VOTE,
  DELETE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE_FAILURE,

  RECEIVE_PROPOSAL_COMMENTS,

  CREATE_PROPOSAL_COMMENT,
  CREATE_PROPOSAL_COMMENT_SUCCESS,
  CREATE_PROPOSAL_COMMENT_FAILURE,
} from '../constants/ProposalConstants';

export default {

  load: (form) => {
    Fetcher
      .get(`proposal_form/${form}/proposals`)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_PROPOSALS,
          proposals: data.proposals,
        });
        return true;
      });
  },

  vote: (proposal, data) => {
    AppDispatcher.dispatch({
      actionType: CREATE_PROPOSAL_VOTE,
    });
    return Fetcher
    .post(`proposals/${proposal}/votes`, data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_PROPOSAL_VOTE_SUCCESS,
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_PROPOSAL_VOTE_FAILURE,
      });
    });
  },

  deleteVote: (proposal) => {
    AppDispatcher.dispatch({
      actionType: DELETE_PROPOSAL_VOTE,
    });
    return Fetcher
      .delete(`proposals/${proposal}/votes`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_PROPOSAL_VOTE_SUCCESS,
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_PROPOSAL_VOTE_FAILURE,
        });
      });
  },

  loadComments: (proposal, filter, offset, limit) => {
    return Fetcher
      .get(`proposals/${proposal}/comments?filter=${filter}&offset=${offset}&limit=${limit}`)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_PROPOSAL_COMMENTS,
          comments: data.comments,
        });
        return true;
      });
  },

  addComment: (proposal, data) => {
    AppDispatcher.dispatch({
      actionType: CREATE_PROPOSAL_COMMENT,
    });
    return Fetcher
      .post(`proposals/${proposal}/comments`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_PROPOSAL_COMMENT_SUCCESS,
          type: data.type,
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_PROPOSAL_COMMENT_FAILURE,
        });
      });
  },

};
