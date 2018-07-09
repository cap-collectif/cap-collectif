import Fetcher from '../services/Fetcher';
import AppDispatcher from '../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../constants/AlertConstants';

const baseUrl = opinion => (opinion.parent ? `opinions/${opinion.parent.id}/versions` : 'opinions');

export default {
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
