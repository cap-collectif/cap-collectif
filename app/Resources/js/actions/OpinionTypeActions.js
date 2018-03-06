import Fetcher from '../services/Fetcher';

export default {
  getAvailableTypes: type => {
    return Fetcher.get(`/opinion_types/${type}`).then(opinionType => {
      return opinionType.availableLinkTypes;
    });
  }
};
