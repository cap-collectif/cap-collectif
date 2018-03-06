import Fetcher from '../services/Fetcher';

export default {
  addVote: source => {
    return Fetcher.post(`/sources/${source}/votes`, {}).then(() => {
      return true;
    });
  },

  deleteVote: source => {
    return Fetcher.delete(`/sources/${source}/votes`).then(() => {
      return true;
    });
  }
};
