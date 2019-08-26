// @flow
import Fetcher from '../services/Fetcher';

export default {
  addVote: (source: string) => Fetcher.post(`/sources/${source}/votes`, {}).then(() => true),

  deleteVote: (source: string) => Fetcher.delete(`/sources/${source}/votes`).then(() => true),
};
