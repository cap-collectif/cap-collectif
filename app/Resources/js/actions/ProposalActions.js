import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher, { json } from '../services/Fetcher';
import ProposalStore from '../stores/ProposalStore';
import flatten from 'flat';

import {
  RECEIVE_PROPOSAL,
  RECEIVE_PROPOSAL_VOTES,
  UPDATE_PROPOSAL_SUCCESS,
  UPDATE_PROPOSAL_FAILURE,
  DELETE_PROPOSAL_SUCCESS,
  DELETE_PROPOSAL_FAILURE,

} from '../constants/ProposalConstants';
import { UPDATE_ALERT } from '../constants/AlertConstants';

export default {

  initProposal: (proposal) => {
    AppDispatcher.dispatch({
      actionType: INIT_PROPOSAL,
      proposal,
    });
  },

  initVotableSteps: (votableSteps) => {
    AppDispatcher.dispatch({
      actionType: INIT_VOTABLE_STEPS,
      votableSteps,
    });
  },

  load: (fetchFrom, id) => {
    const page = ProposalStore.currentPage;
    const pagination = PROPOSAL_PAGINATION;

    const order = ProposalStore.order;
    const filters = ProposalStore.filters;
    const terms = ProposalStore.terms;

    let url = null;
    const data = {};

    switch (fetchFrom) {
      case 'form':
        url = `/proposal_forms/${id}/proposals/search`;
        break;
      case 'selectionStep':
        url = `/selection_steps/${id}/proposals/search`;
        break;
      default:
        break;
    }

    if (!url) {
      return false;
    }

    url += `?page=${page}&pagination=${pagination}&order=${order}`;

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
            order: result.order,
            creditsLeft: result.creditsLeft || null,
          });
          return true;
        });
      });
  },

  loadSuggestions: (id, value) => {
    return Fetcher
      .post(`/proposal_forms/${id}/proposals/search`, {
        terms: value,
        order: 'old',
      })
      .then(json)
    ;
  },

  loadProposalVotes: (step, proposal) => {
    Fetcher
      .get(`/steps/${step}/proposals/${proposal}/votes`)
      .then((result) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_PROPOSAL_VOTES,
          votes: result.votes,
          votesCount: result.count,
          stepId: step,
        });
        return true;
      });
  },

  loadVotableSteps: (projectId) => {
    Fetcher
      .get(`/projects/${projectId}/votable_steps`)
      .then((result) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_VOTABLE_STEPS,
          votableSteps: result.votableSteps,
        });
        return true;
      });
  },

  loadProposalVotesForUser: (projectId) => {
    Fetcher
      .get(`/projects/${projectId}/user_votes`)
      .then((result) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_PROPOSAL_VOTES,
          votes: result.votes,
          votesCount: result.count,
        });
        return true;
      });
  },

  changePage: (page) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_PAGE,
      page,
    });
  },

  changeOrder: (newOrder) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_ORDER,
      order: newOrder,
    });
  },

  changeSearchTerms: (terms) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_SEARCH_TERMS,
      terms,
    });
  },

  changeFilterValue: (filterName, value) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_FILTERS,
      filter: filterName,
      value,
    });
  },

  submit: () => {
    AppDispatcher.dispatch({
      actionType: SUBMIT_PROPOSAL,
    });
  },

  validationFailure: () => {
    AppDispatcher.dispatch({
      actionType: PROPOSAL_VALIDATION_FAILURE,
    });
  },

  add: (form, data, successMessage = 'proposal.request.create.success', errorMessage = 'proposal.request.create.failure') => {
    const formData = new FormData();
    data = flatten(data);
    Object.keys(data).map((key) => {
      formData.append(key, data[key]);
    });
    return Fetcher
      .postFormData(`/proposal_forms/${form}/proposals`, formData)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_PROPOSAL_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: successMessage },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_PROPOSAL_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: errorMessage },
        });
        return false;
      })
    ;
  },

  update: (form, proposal, data, successMessage = 'proposal.request.update.success', errorMessage = 'proposal.request.update.failure') => {
    const formData = new FormData();
    data = flatten(data);
    Object.keys(data).map((key) => {
      formData.append(key, data[key]);
    });
    return Fetcher
      .postFormData(`/proposal_forms/${form}/proposals/${proposal}`, formData)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_PROPOSAL_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: successMessage },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_PROPOSAL_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: errorMessage },
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
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: successMessage },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_PROPOSAL_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: errorMessage },
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
          proposal: data.proposal,
          userHasVote: data.userHasVote,
        });
        return true;
      });
  },
};
