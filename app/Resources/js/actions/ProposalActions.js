import Fetcher, { json } from '../services/Fetcher';

export const loadSuggestions = (id, value) => {
  return Fetcher.post(`/collect_steps/${id}/proposals/search`, {
    terms: value,
    order: 'old',
  }).then(json);
};
