import Fetcher from '../services/Fetcher';

export default {

  login: (data) => {
    return fetch(window.location.protocol + '//' + window.location.host + '/login_check', {
      method: 'post',
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    .then(response => response.json())
    .then(response => {
      if (response.success) {
        setTimeout(() => window.location.reload(), 100);
        return true;
      }
      throw new Error(response.message);
    });
  },

  register: (data) => {
    return Fetcher.postWithoutStatusCheck('/users', data);
  },
};
