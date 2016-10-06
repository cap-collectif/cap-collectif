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

export default {
  //
  // loadProposalVotes: (step, proposal) => {
  //   Fetcher
  //     .get(`/steps/${step}/proposals/${proposal}/votes`)
  //     .then((result) => {
  //       AppDispatcher.dispatch({
  //         actionType: RECEIVE_PROPOSAL_VOTES,
  //         votes: result.votes,
  //         votesCount: result.count,
  //         stepId: step,
  //       });
  //       return true;
  //     });
  // },

  // loadProposalVotesForUser: (projectId) => {
  //   Fetcher
  //     .get(`/projects/${projectId}/user_votes`)
  //     .then((result) => {
  //       AppDispatcher.dispatch({
  //         actionType: RECEIVE_PROPOSAL_VOTES,
  //         votes: result.votes,
  //         votesCount: result.count,
  //       });
  //       return true;
  //     });
  // },

};
