import Fetcher from '../services/Fetcher';

export default {
  getAll: () => Fetcher.get('/themes'),
};
