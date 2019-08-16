// @flow
import Fetcher from '../services/Fetcher';
import AppDispatcher from '../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../constants/AlertConstants';

const baseUrl = opinion => (opinion.parent ? `opinions/${opinion.parent.id}/versions` : 'opinions');

export default {
  report: (opinion, argument, data) =>
    Fetcher.post(`/${baseUrl(opinion)}/${opinion.id}/arguments/${argument}/reports`, data).then(
      () => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: { bsStyle: 'success', content: 'alert.success.report.argument' },
        });
      },
    ),
};
