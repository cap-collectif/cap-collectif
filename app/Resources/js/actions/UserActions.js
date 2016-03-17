import AppDispatcher from '../dispatchers/AppDispatcher';
import { LOGIN, REGISTER } from '../constants/UserConstants';

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
          window.location.reload();
          return true;
        }
        throw new Error(response.message);
    });
  },

  register: (data) => {
    AppDispatcher.dispatch({
      actionType: LOGIN,
    });
  },

};
