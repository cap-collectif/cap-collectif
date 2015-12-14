import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import ProposalStore from '../stores/ProposalStore';
import LocalStorageService from '../services/LocalStorageService';
import {
  RECEIVE_PROPOSAL,
  RECEIVE_PROPOSALS,

  SUBMIT_PROPOSAL,
  VALIDATION_FAILURE,
  CREATE_PROPOSAL_SUCCESS,
  CREATE_PROPOSAL_FAILURE,
  UPDATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_FAILURE,
  DELETE_PROPOSAL_SUCCESS,
  DELETE_PROPOSAL_FAILURE,

  CREATE_PROPOSAL_VOTE,
  CREATE_PROPOSAL_VOTE_SUCCESS,
  CREATE_PROPOSAL_VOTE_FAILURE,
  DELETE_PROPOSAL_VOTE,
  DELETE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE_FAILURE,

  CHANGE_PAGE,
  CHANGE_ORDER,
  CHANGE_SEARCH_TERMS,
  CHANGE_FILTERS,
  PROPOSAL_PAGINATION,

} from '../constants/ProposalConstants';

export default {

  load: (fetchFrom, id) => {
    const page = ProposalStore.currentPage;
    const order = ProposalStore.order;
    const filters = ProposalStore.filters;
    const terms = ProposalStore.terms;
    const first = page ? PROPOSAL_PAGINATION * (page - 1) : 0;
    const offset = page ? PROPOSAL_PAGINATION : 100;
    const sort = 'score';

    let url = null;
    const data = {};

    switch (fetchFrom) {
    case 'form':
      url = `/proposal_forms/${id}/proposals`;
      break;
    case 'selectionStep':
      url = `/selection_steps/${id}/proposals`;
      break;
    default:
      break;
    }

    if (!url) {
      return false;
    }

    url += `?order=${order}&first=${first}&offset=${offset}`;

    data.sort = sort;
    data.page = page;
    data.pagination = PROPOSAL_PAGINATION;
    data.terms = terms;
    data.filters = filters;

    Fetcher
      .post(url, data)
      .then((response) => {
        const promise = response.json();
        promise.then((result) => {
          AppDispatcher.dispatch({
            actionType: RECEIVE_PROPOSALS,
            proposals: result.proposals,
            count: result.count,
          });
          return true;
        });
      });
  },

  changePage: (page) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_PAGE,
      page: page,
    });
  },

  changeOrder: (newOrder) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_ORDER,
      order: newOrder,
    });
    LocalStorageService.set('proposals_order', ProposalStore.order);
  },

  changeSearchTerms: (terms) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_SEARCH_TERMS,
      terms: terms,
    });
  },

  changeFilterValue: (filterName, value) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_FILTERS,
      filter: filterName,
      value: value,
    });
    LocalStorageService.set('proposals_filters', ProposalStore.filters);
  },

  submit: () => {
    AppDispatcher.dispatch({
      actionType: SUBMIT_PROPOSAL,
    });
  },

  validationFailure: () => {
    AppDispatcher.dispatch({
      actionType: VALIDATION_FAILURE,
    });
  },

  add: (form, data, successMessage = 'proposal.request.create.success', errorMessage = 'proposal.request.create.failure') => {
    return Fetcher
      .post(`/proposal_forms/${form}/proposals`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_PROPOSAL_SUCCESS,
          message: successMessage,
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_PROPOSAL_FAILURE,
          message: errorMessage,
        });
        return false;
      })
    ;
  },

  update: (form, proposal, data, successMessage = 'proposal.request.update.success', errorMessage = 'proposal.request.update.failure') => {
    return Fetcher
      .put(`/proposal_forms/${form}/proposals/${proposal}`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_PROPOSAL_SUCCESS,
          message: successMessage,
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_PROPOSAL_FAILURE,
          message: errorMessage,
        });
        return false;
      })
    ;
  },

  delete: (form, proposal, successMessage = 'proposal.request.delete.success', errorMessage = 'proposal.request.delete.failure') => {
    return Fetcher
      .delete(`/proposal_forms/${form}/proposals/${proposal}`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_PROPOSAL_SUCCESS,
          message: successMessage,
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_PROPOSAL_FAILURE,
          message: errorMessage,
        });
        return false;
      })
    ;
  },

  getOne: (form, proposal) => {
    Fetcher
      .get(`/proposal_forms/${form}/proposals/${proposal}`)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_PROPOSAL,
          proposal: data,
        });
        return true;
      });
  },

  vote: (form, proposal, selectionStep, data, successMessage = 'proposal.request.vote.success', errorMessage = 'proposal.request.vote.failure') => {
    AppDispatcher.dispatch({
      actionType: CREATE_PROPOSAL_VOTE,
    });
    return Fetcher
    .post(`/proposal_forms/${form}/proposals/${proposal}/votes`, data)
    .then(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_PROPOSAL_VOTE_SUCCESS,
        message: successMessage,
      });
      return true;
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: CREATE_PROPOSAL_VOTE_FAILURE,
        message: errorMessage,
      });
    });
  },

  deleteVote: (form, proposal) => {
    AppDispatcher.dispatch({
      actionType: DELETE_PROPOSAL_VOTE,
    });
    return Fetcher
      .delete(`/proposal_forms/${form}/proposals/${proposal}/votes`)
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

};
