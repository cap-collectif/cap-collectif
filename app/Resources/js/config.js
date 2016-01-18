export default {
  api: (typeof window !== 'undefined' ? window.location.protocol : 'http') + '//' + (typeof window !== 'undefined' ? window.location.host : 'capco.test/') + '/api',
};
