import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher, { json } from '../services/Fetcher';
import IdeaStore from '../stores/IdeaStore';
import {
  SET_IDEAS_PAGINATION,
  INIT_IDEAS_COUNTS,
  INIT_IDEAS,
  CHANGE_IDEAS_PAGE,
  CHANGE_IDEAS_SEARCH_TERMS,
  CHANGE_IDEAS_ORDER,
  CHANGE_IDEAS_THEME,
  CREATE_IDEA_SUCCESS,
  CREATE_IDEA_FAILURE,
  UPDATE_IDEA_SUCCESS,
  UPDATE_IDEA_FAILURE,
  DELETE_IDEA_SUCCESS,
  DELETE_IDEA_FAILURE,
  RECEIVE_IDEAS,
} from '../constants/IdeaConstants';
import { UPDATE_ALERT } from '../constants/AlertConstants';

export default {
  initIdeas: ideas => {
    AppDispatcher.dispatch({
      actionType: INIT_IDEAS,
      ideas,
    });
  },

  setPagination: pagination => {
    AppDispatcher.dispatch({
      actionType: SET_IDEAS_PAGINATION,
      pagination,
    });
  },

  initCounts: (count = 0, countTrashed = 0) => {
    AppDispatcher.dispatch({
      actionType: INIT_IDEAS_COUNTS,
      count,
      countTrashed,
    });
  },

  load: () => {
    const pagination = IdeaStore.pagination;
    const page = IdeaStore.currentPage;

    const order = IdeaStore.order;
    const theme = IdeaStore.theme;
    const terms = IdeaStore.terms;

    const url = `/ideas/search?pagination=${pagination}&page=${page}&order=${order}`;

    const data = {};
    data.terms = terms;
    data.theme = theme;

    Fetcher.post(url, data).then(response => {
      const promise = response.json();
      promise.then(result => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_IDEAS,
          ideas: result.ideas,
          count: result.count,
          countTrashed: result.countTrashed,
        });
        return true;
      });
    });
  },

  changePage: page => {
    AppDispatcher.dispatch({
      actionType: CHANGE_IDEAS_PAGE,
      page,
    });
  },

  changeOrder: order => {
    AppDispatcher.dispatch({
      actionType: CHANGE_IDEAS_ORDER,
      order,
    });
  },

  changeTheme: theme => {
    AppDispatcher.dispatch({
      actionType: CHANGE_IDEAS_THEME,
      theme,
    });
  },

  changeSearchTerms: terms => {
    AppDispatcher.dispatch({
      actionType: CHANGE_IDEAS_SEARCH_TERMS,
      terms,
    });
  },

  add: data => {
    const formData = new FormData();
    Object.keys(data).map(key => {
      formData.append(key, data[key]);
    });

    return Fetcher.postFormData('/ideas', formData)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_IDEA_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.add.idea' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_IDEA_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'alert.danger.add.idea' },
        });
        return false;
      });
  },

  update: (idea, data) => {
    const formData = new FormData();
    Object.keys(data).map(key => {
      formData.append(key, data[key]);
    });
    return Fetcher.postFormData(`/ideas/${idea}`, formData)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_IDEA_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.update.idea' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_IDEA_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'alert.danger.update.idea' },
        });
        return false;
      });
  },

  delete: idea => {
    return Fetcher.delete(`/ideas/${idea}`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_IDEA_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.delete.idea' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_IDEA_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'alert.danger.delete.idea' },
        });
        return false;
      });
  },

  deleteVote: idea => {
    return Fetcher.delete(`/ideas/${idea}/votes`)
      .then(json)
      .then(vote => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.delete.vote' },
        });
        return vote;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'alert.danger.delete.vote' },
        });
        return false;
      });
  },
};
