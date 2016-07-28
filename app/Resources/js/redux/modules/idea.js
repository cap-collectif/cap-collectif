import Fetcher from '../../services/Fetcher';

export const VOTES_LOADED = 'idea/VOTES_LOADED';

const initialState = {
  currentIdeaById: null,
  ideas: [],
};

const votesLoaded = (votes) => {
  return {
    type: VOTES_LOADED,
    payload: {
      votes: votes,
    },
  };
};

export const loadAllVotes = (idea, dispatch) => {
  return new Promise((resolve, reject) => {
    Fetcher
      .get(`/ideas/${idea}/votes`)
      .then((result) => {
        dispatch(votesLoaded(result.votes));
        resolve();
      })
      .catch(() => {
        console.error('Failed to load votes.'); // eslint-disable-line no-console
        reject({ _error: 'Failed to submit report!' });
      });
  });
};


export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case VOTES_LOADED:
      // return Object.assign({}, state, { i: action.payload.id });
    default:
      return state;
  }
};
