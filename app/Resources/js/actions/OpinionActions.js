// @flow
import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import { DELETE_OPINION_SUCCESS, DELETE_OPINION_FAILURE } from '../constants/OpinionConstants';

export default {
  deleteOpinion: (opinion: string) => {
    return Fetcher.delete(`/opinions/${opinion}`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_SUCCESS,
        });
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_FAILURE,
        });
      });
  },
};
