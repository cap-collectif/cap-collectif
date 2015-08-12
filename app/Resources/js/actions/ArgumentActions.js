import Fetcher from '../services/Fetcher';

export default {

  addVote: (argument) => {
    return Fetcher
    .post('/arguments/' + argument + '/votes', {})
    .then(() => {
      return true;
    });
  },

  deleteVote: (argument) => {
    return Fetcher
    .delete('/arguments/' + argument + '/votes')
    .then(() => {
      return true;
    });
  },

};
