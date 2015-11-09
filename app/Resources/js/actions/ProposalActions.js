import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import ProposalStore from '../stores/ProposalStore';
import {
  RECEIVE_PROPOSAL,
  RECEIVE_PROPOSALS,

  CREATE_PROPOSAL_VOTE,
  CREATE_PROPOSAL_VOTE_SUCCESS,
  CREATE_PROPOSAL_VOTE_FAILURE,

  DELETE_PROPOSAL_VOTE,
  DELETE_PROPOSAL_VOTE_SUCCESS,
  DELETE_PROPOSAL_VOTE_FAILURE,

  CHANGE_PAGE,
  CHANGE_ORDER,
  CHANGE_FILTERS,
  PROPOSAL_PAGINATION,

} from '../constants/ProposalConstants';

export default {

  load: (form) => {
    const page = ProposalStore.currentPage;
    const order = ProposalStore.order;
    const filters = ProposalStore.filters;
    const first = page ? PROPOSAL_PAGINATION * (page - 1) : 0;
    const offset = page ? PROPOSAL_PAGINATION : 100;
    let url = `/proposal_forms/${form}/proposals?order=${order}&first=${first}&offset=${offset}`;
    for (const filter in filters) {
      if (filters.hasOwnProperty(filter)) {
        url += `&${filter}=${filters[filter]}`;
      }
    }

    Fetcher
      .get(url)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_PROPOSALS,
          proposals: data.proposals,
          count: data.count,
        });
        return true;
      });
  },

  changePage: (page) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_PAGE,
      page: page,
    });
  },

  changeOrder: (order) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_ORDER,
      order: order,
    });
  },

  changeFilterValue: (filter, value) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_FILTERS,
      filter: filter,
      value: value,
    });
  },

  add: (form, data) => {
    return Fetcher.post(`/proposal_forms/${form}/proposals`, data);
  },

  update: (form, proposal, data) => {
    return Fetcher.put(`/proposal_forms/${form}/proposals/${proposal}`, data);
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

  vote: (form, proposal, data) => {
    AppDispatcher.dispatch({
      actionType: CREATE_PROPOSAL_VOTE,
    });
    return Fetcher
    .post(`/proposal_forms/${form}/proposals/${proposal}/votes`, data)
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
