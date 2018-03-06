// @flow
import Fetcher, { json } from '../services/Fetcher';

export const loadSuggestions = (id: string, value: ?string) => {
  return Fetcher.post(`/collect_steps/${id}/proposals/search`, {
    terms: value,
    order: 'old'
  }).then(json);
};
