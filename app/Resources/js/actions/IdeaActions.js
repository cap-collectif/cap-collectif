import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import IdeaStore from '../stores/IdeaStore';
import {
  SET_IDEAS_PAGINATION,
  INIT_IDEAS_COUNTS,
  INIT_IDEA,
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

  CREATE_IDEA_VOTE,
  CREATE_IDEA_VOTE_SUCCESS,
  CREATE_IDEA_VOTE_FAILURE,
  DELETE_IDEA_VOTE,
  DELETE_IDEA_VOTE_SUCCESS,
  DELETE_IDEA_VOTE_FAILURE,

  REPORT_IDEA_SUCCESS,

  RECEIVE_IDEAS,
  RECEIVE_IDEA,
  RECEIVE_IDEA_VOTES,
} from '../constants/IdeaConstants';
import {
  CREATE_COMMENT_SUCCESS,
  CREATE_COMMENT_FAILURE,
} from '../constants/CommentConstants';
import { UPDATE_ALERT } from '../constants/AlertConstants';

export default {

  initIdea: (idea) => {
    AppDispatcher.dispatch({
      actionType: INIT_IDEA,
      idea: idea,
    });
  },

  initIdeas: (ideas) => {
    AppDispatcher.dispatch({
      actionType: INIT_IDEAS,
      ideas: ideas,
    });
  },

  setPagination: (pagination) => {
    AppDispatcher.dispatch({
      actionType: SET_IDEAS_PAGINATION,
      pagination: pagination,
    });
  },

  initCounts: (count = 0, countTrashed = 0) => {
    AppDispatcher.dispatch({
      actionType: INIT_IDEAS_COUNTS,
      count: count,
      countTrashed: countTrashed,
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

    Fetcher
      .post(url, data)
      .then((response) => {
        const promise = response.json();
        promise.then((result) => {
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

  changePage: (page) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_IDEAS_PAGE,
      page: page,
    });
  },

  changeOrder: (order) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_IDEAS_ORDER,
      order: order,
    });
  },

  changeTheme: (theme) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_IDEAS_THEME,
      theme: theme,
    });
  },

  changeSearchTerms: (terms) => {
    AppDispatcher.dispatch({
      actionType: CHANGE_IDEAS_SEARCH_TERMS,
      terms: terms,
    });
  },

  getOne: (idea) => {
    Fetcher
      .get(`/ideas/${idea}`)
      .then((data) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_IDEA,
          idea: data.idea,
        });
        return true;
      });
  },

  add: (data) => {
    const formData = new FormData();
    Object.keys(data).map((key) => {
      formData.append(key, data[key]);
    });

    return Fetcher
      .postFormData('/ideas', formData)
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
      })
    ;
  },

  update: (idea, data) => {
    const formData = new FormData();
    Object.keys(data).map((key) => {
      formData.append(key, data[key]);
    });

    return Fetcher
      .postFormData(`/ideas/${idea}`, formData)
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
      })
    ;
  },

  delete: (idea) => {
    return Fetcher
      .delete(`/ideas/${idea}`)
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
      })
    ;
  },

  loadVotes: (idea) => {
    Fetcher
      .get(`/ideas/${idea}/votes`)
      .then((result) => {
        AppDispatcher.dispatch({
          actionType: RECEIVE_IDEA_VOTES,
          votes: result.votes,
          votesCount: result.count,
        });
        return true;
      });
  },

  vote: (idea, data = {}) => {
    const hasComment = data.comment && data.comment.length > 0;
    AppDispatcher.dispatch({
      actionType: CREATE_IDEA_VOTE,
      idea: idea,
      hasComment: hasComment,
    });
    return Fetcher
      .post(`/ideas/${idea}/votes`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: CREATE_IDEA_VOTE_SUCCESS,
          hasComment: hasComment,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.add.vote' },
        });
        if (hasComment) {
          AppDispatcher.dispatch({
            actionType: CREATE_COMMENT_SUCCESS,
            message: 'comment.submit_success',
          });
        }
        return true;
      })
      .catch((error) => {
        AppDispatcher.dispatch({
          actionType: CREATE_IDEA_VOTE_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'alert.danger.add.vote' },
        });
        if (hasComment) {
          AppDispatcher.dispatch({
            actionType: CREATE_COMMENT_FAILURE,
            message: 'comment.submit_error',
          });
        }
        throw error;
      });
  },

  deleteVote: (idea) => {
    AppDispatcher.dispatch({
      actionType: DELETE_IDEA_VOTE,
      idea: idea,
    });
    return Fetcher
      .delete(`/ideas/${idea}/votes`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_IDEA_VOTE_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.delete.vote' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_IDEA_VOTE_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'warning', content: 'alert.danger.delete.vote' },
        });
        return false;
      });
  },

  report: (idea, data) => {
    return Fetcher
      .post(`/ideas/${idea}/reports`, data)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: REPORT_IDEA_SUCCESS,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.report.idea' },
        });
      })
      ;
  },

};
