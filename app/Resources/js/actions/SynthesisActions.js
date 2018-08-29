import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import * as Actions from '../constants/SynthesisActionsConstants';

export default {
  updateDisplaySettings: (synthesis, settings) =>
    Fetcher.put(`/syntheses/${synthesis}/display`, settings),
  load: synthesis =>
    Fetcher.get(`/syntheses/${synthesis}`).then(data => {
      AppDispatcher.dispatch({
        actionType: Actions.RECEIVE_SYNTHESIS,
        synthesis: data,
      });
      return true;
    }),
};
