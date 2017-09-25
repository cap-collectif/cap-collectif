import AppDispatcher from '../dispatchers/AppDispatcher';
import Fetcher from '../services/Fetcher';
import {
  RECEIVE_OPINION,
  DELETE_OPINION_SUCCESS,
  DELETE_OPINION_FAILURE,
  DELETE_OPINION_VERSION_SUCCESS,
  DELETE_OPINION_VERSION_FAILURE,
} from '../constants/OpinionConstants';

export default {
  loadOpinion: (opinionId, versionId) => {
    const url = versionId
      ? `/opinions/${opinionId}/versions/${versionId}`
      : `/opinions/${opinionId}`;
    Fetcher.get(url).then(data => {
      AppDispatcher.dispatch({
        actionType: RECEIVE_OPINION,
        opinion: data.opinion ? data.opinion : data.version,
        rankingThreshold: data.rankingThreshold,
        opinionTerm: data.opinionTerm,
      });
      return true;
    });
  },

  deleteOpinion: opinion => {
    return Fetcher.delete(`/opinions/${opinion}`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_SUCCESS,
        });
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_FAILURE,
        });
      });
  },

  // Vote for opinion or version
  loadAllVotes: async (opinionId, versionId) => {
    const url = versionId
      ? `/opinions/${opinionId}/versions/${versionId}/votes`
      : `/opinions/${opinionId}/votes`;
    let hasMore = true;
    let iterationCount = 0;
    const votesPerIteration = 30;
    const votes = [];
    while (hasMore) {
      // eslint-disable-next-line no-await-in-loop
      const result = await Fetcher.get(
        `${url}?offset=${iterationCount * votesPerIteration}&limit=${votesPerIteration}`,
      );
      hasMore = result.hasMore;
      iterationCount++;
      for (const vote of result.votes) {
        votes.push(vote);
      }
    }
    return votes;
  },

  deleteVersion: (version, opinion) => {
    return Fetcher.delete(`/opinions/${opinion}/versions/${version}`)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_VERSION_SUCCESS,
        });
      })
      .catch(() => {
        AppDispatcher.dispatch({
          actionType: DELETE_OPINION_VERSION_FAILURE,
        });
      });
  },

  addVersionSource: (opinion, version, data) => {
    return Fetcher.post(`/opinions/${opinion}/versions/${version}/sources`, data).then(() => {
      return true;
    });
  },
};
