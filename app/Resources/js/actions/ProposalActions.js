import Fetcher, { json } from '../services/Fetcher';

export const loadSuggestions = (id, value) => {
  return Fetcher
    .post(`/proposal_forms/${id}/proposals/search`, {
      terms: value,
      order: 'old',
    })
    .then(json)
  ;
};
