import Fetcher from '../services/Fetcher';

export default {
  getAll: () => {
    return Fetcher.get('/themes');
  }
};
