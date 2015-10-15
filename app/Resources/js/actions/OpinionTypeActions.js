import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';

export default {

  getAvailableTypes: (type) => {
    return Fetcher
    .get(`/opinion_types/${type}`)
    .then((data) => {
      return data.json();
    })
    .catch(() => {});
  },

};
