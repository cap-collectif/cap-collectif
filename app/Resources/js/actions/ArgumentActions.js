import Fetcher from '../services/Fetcher';
import AppDispatcher from '../dispatchers/AppDispatcher';
import {
  CREATE_ARGUMENT_SUCCESS,
  UPDATE_ARGUMENT_SUCCESS,
  UPDATE_ARGUMENT_FAILURE,
} from '../constants/ArgumentConstants';
import { UPDATE_ALERT } from '../constants/AlertConstants';

const baseUrl = opinion => (opinion.parent ? `opinions/${opinion.parent.id}/versions` : 'opinions');

export default {
  add: (opinion, data) => {
    return Fetcher.post(`/${baseUrl(opinion)}/${opinion.id}/arguments`, data).then(argument => {
      AppDispatcher.dispatch({
        actionType: CREATE_ARGUMENT_SUCCESS,
        type: data.type,
        argument: argument.json(),
      });
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.add.argument' },
      });
      return true;
    });
  },

  update: (opinion, argument, data) => {
    return Fetcher.put(`/${baseUrl(opinion)}/${opinion.id}/arguments/${argument}`, data)
      .then(updatedArgument => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ARGUMENT_SUCCESS,
          argument: updatedArgument.json(),
          type: data.type,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.update.argument' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ARGUMENT_FAILURE,
        });
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'danger', content: 'alert.danger.update.argument' },
        });
      });
  },

  delete: (opinion, argument) => {
    return Fetcher.delete(`/${baseUrl(opinion)}/${opinion.id}/arguments/${argument}`).then(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.delete.argument' },
      });
    });
  },

  report: (opinion, argument, data) => {
    return Fetcher.post(
      `/${baseUrl(opinion)}/${opinion.id}/arguments/${argument}/reports`,
      data,
    ).then(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.report.argument' },
      });
    });
  },

  addVote: argument => {
    return Fetcher.post(`/arguments/${argument}/votes`, {})
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.add.vote' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'danger', content: 'alert.danger.add.vote' },
        });
      });
  },

  deleteVote: argument => {
    return Fetcher.delete(`/arguments/${argument}/votes`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.delete.vote' },
        });
        return true;
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'danger', content: 'alert.danger.delete.vote' },
        });
      });
  },
};
