// @flow
import Fetcher from '../services/Fetcher';

export default {
  load: (
    stepId: string,
    key: string,
    limit: ?number = null,
    theme: ?string = null,
    district: ?string = null,
    category: ?string = null,
  ) =>
    Fetcher.get(
      // $FlowFixMe
      `/project_stats/${stepId}?key=${key}&limit=${limit}&theme=${theme}&district=${district}&category=${category}`,
    ),
};
