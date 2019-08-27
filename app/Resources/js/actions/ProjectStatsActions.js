import Fetcher from '../services/Fetcher';

export default {
  load: (stepId, key, limit = null, theme = null, district = null, category = null) =>
    Fetcher.get(
      `/project_stats/${stepId}?key=${key}&limit=${limit}&theme=${theme}&district=${district}&category=${category}`,
    ),
};
