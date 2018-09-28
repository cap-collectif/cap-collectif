import Fetcher from '../services/Fetcher';

export default {
  addVote: source => Fetcher.post(`/sources/${source}/votes`, {}).then(() => true),

  deleteVote: source => Fetcher.delete(`/sources/${source}/votes`).then(() => true),
};
